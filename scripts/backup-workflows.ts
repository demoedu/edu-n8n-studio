#!/usr/bin/env bun

/**
 * n8n Workflow Backup Script
 *
 * n8n API를 사용하여 모든 워크플로우를 JSON 파일로 백업하고 Git에 커밋합니다.
 */

import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { execSync } from 'child_process';

interface Workflow {
  id: string;
  name: string;
  active: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

interface WorkflowDetail {
  id: string;
  name: string;
  active: boolean;
  nodes: any[];
  connections: any;
  settings: any;
  staticData: any;
  tags: any[];
  updatedAt: string;
}

const N8N_API_URL = process.env.N8N_API_URL || 'http://localhost:5678';
const N8N_API_KEY = process.env.N8N_API_KEY;
const BACKUP_DIR = join(process.cwd(), 'workflows', 'backups');
const METADATA_FILE = join(process.cwd(), 'workflows', 'metadata.json');

async function fetchAllWorkflows(): Promise<Workflow[]> {
  const workflows: Workflow[] = [];
  let cursor: string | undefined;
  let hasMore = true;

  while (hasMore) {
    const url = new URL(`${N8N_API_URL}/api/v1/workflows`);
    url.searchParams.set('limit', '100');
    if (cursor) {
      url.searchParams.set('cursor', cursor);
    }

    const headers: HeadersInit = {
      'Accept': 'application/json',
    };

    if (N8N_API_KEY) {
      headers['X-N8N-API-KEY'] = N8N_API_KEY;
    }

    const response = await fetch(url.toString(), { headers });

    if (!response.ok) {
      throw new Error(`Failed to fetch workflows: ${response.statusText}`);
    }

    const data = await response.json();
    workflows.push(...data.data);

    hasMore = data.nextCursor !== null;
    cursor = data.nextCursor;
  }

  return workflows;
}

async function fetchWorkflowDetail(workflowId: string): Promise<WorkflowDetail> {
  const url = `${N8N_API_URL}/api/v1/workflows/${workflowId}`;

  const headers: HeadersInit = {
    'Accept': 'application/json',
  };

  if (N8N_API_KEY) {
    headers['X-N8N-API-KEY'] = N8N_API_KEY;
  }

  const response = await fetch(url, { headers });

  if (!response.ok) {
    throw new Error(`Failed to fetch workflow ${workflowId}: ${response.statusText}`);
  }

  return response.json();
}

function sanitizeFilename(name: string): string {
  return name
    .replace(/[^a-zA-Z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 100);
}

async function backupWorkflows(): Promise<void> {
  console.log('🔍 Fetching all workflows...');
  const workflows = await fetchAllWorkflows();
  console.log(`📦 Found ${workflows.length} workflows`);

  // 백업 디렉토리 생성
  await mkdir(BACKUP_DIR, { recursive: true });

  const metadata: Array<{
    id: string;
    name: string;
    filename: string;
    active: boolean;
    isArchived: boolean;
    nodeCount: number;
    updatedAt: string;
    backedUpAt: string;
  }> = [];

  // 각 워크플로우 백업
  for (const workflow of workflows) {
    console.log(`\n📝 Backing up: ${workflow.name} (${workflow.id})`);

    try {
      const detail = await fetchWorkflowDetail(workflow.id);
      const filename = `${sanitizeFilename(workflow.name)}_${workflow.id}.json`;
      const filepath = join(BACKUP_DIR, filename);

      // 워크플로우를 JSON 파일로 저장
      await writeFile(filepath, JSON.stringify(detail, null, 2), 'utf-8');
      console.log(`   ✅ Saved to: ${filename}`);

      metadata.push({
        id: workflow.id,
        name: workflow.name,
        filename,
        active: workflow.active,
        isArchived: workflow.isArchived,
        nodeCount: detail.nodes?.length || 0,
        updatedAt: workflow.updatedAt,
        backedUpAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error(`   ❌ Failed to backup ${workflow.name}:`, error);
    }
  }

  // 메타데이터 저장
  await writeFile(METADATA_FILE, JSON.stringify(metadata, null, 2), 'utf-8');
  console.log(`\n📋 Metadata saved to: ${METADATA_FILE}`);

  // Git 커밋
  try {
    console.log('\n📝 Committing to Git...');
    execSync('git add workflows/', { cwd: process.cwd(), stdio: 'inherit' });

    const commitMessage = `chore: backup n8n workflows (${workflows.length} workflows)

백업 일시: ${new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })}
워크플로우 수: ${workflows.length}개
활성화: ${workflows.filter(w => w.active).length}개
보관됨: ${workflows.filter(w => w.isArchived).length}개`;

    execSync(`git commit -m "${commitMessage}"`, { cwd: process.cwd(), stdio: 'inherit' });
    console.log('✅ Git commit successful');
  } catch (error: any) {
    if (error.status === 1 && error.stdout?.toString().includes('nothing to commit')) {
      console.log('ℹ️  No changes to commit');
    } else {
      console.error('❌ Git commit failed:', error.message);
    }
  }
}

// 실행
backupWorkflows()
  .then(() => {
    console.log('\n✨ Backup completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Backup failed:', error);
    process.exit(1);
  });
