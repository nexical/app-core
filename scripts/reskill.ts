#!/usr/bin/env -S npx tsx

import { execSync } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';

// --- Configuration ---

interface Target {
  name: string;
  skillPath: string;
  truthPath: string;
}

const SKILLS_DIR = '.agent/skills';

// Map specific skills to their "Gold Standard" implementation
const TRUTH_MAP: Record<string, string> = {
  'construct-ui': 'modules/user-ui',
  'construct-api': 'modules/user-api',
  'manage-db': 'modules/project-api',
  'implement-logic': 'modules/project-api',
  'design-data': 'modules/project-api',
  'ensure-security': 'modules/user-api',
  'verify-quality': 'modules/project-api',
  'construct-agent': 'modules/project-api',
  'forge-agent': 'modules/project-api',
};

// Fallback for skills not explicitly mapped
const DEFAULT_TRUTH = 'modules/user-api';

const TMP_DIR = path.join('.agent', 'tmp');
const STATE_FILE = path.join(TMP_DIR, 'reskill-state.json');
const PROMPT_CMD = 'npx prompt';
const ARCH_DOC = 'ARCHITECTURE.md';
const MOD_DOC = 'MODULES.md';

const MODELS = 'gemini-3-flash-preview,gemini-3-pro-preview';

// --- Helpers ---

function ensureTmpDir() {
  if (!fs.existsSync(TMP_DIR)) {
    fs.mkdirSync(TMP_DIR, { recursive: true });
  }
}

function getTargets(): Target[] {
  if (!fs.existsSync(SKILLS_DIR)) {
    console.warn(`Skills directory not found: ${SKILLS_DIR}`);
    return [];
  }

  const entries = fs.readdirSync(SKILLS_DIR, { withFileTypes: true });

  return entries
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => {
      const skillName = dirent.name;
      // specific mapping or default
      const truthPath = TRUTH_MAP[skillName] || DEFAULT_TRUTH;

      return {
        name:
          skillName
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ') + ' Skill',
        skillPath: path.join(SKILLS_DIR, skillName),
        truthPath: truthPath,
      };
    });
}

function runAgent(agentName: string, agentFile: string, args: Record<string, string>) {
  // Add models flag
  const allArgs = { ...args, models: MODELS };

  const flags = Object.entries(allArgs)
    .map(([key, value]) => `--${key} "${value}"`)
    .join(' ');

  const cmd = `${PROMPT_CMD} ${agentFile} ${flags}`;
  try {
    // Inherit stdio so logs stream to user
    execSync(cmd, { stdio: 'inherit' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Agent ${agentName} failed execution: ${message}`);
  }
}

function checkFileExists(filePath: string, stepName: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${stepName} failed: Output file ${filePath} was not created.`);
  }
  return fs.readFileSync(filePath, 'utf-8');
}

// --- Pipeline Stages ---

function stageAuditor(target: Target): string {
  console.info(`\uD83D\uDD75\ufe0f  Auditing ${target.name}...`);
  const outputFile = path.join(TMP_DIR, `${target.name.replace(/\s+/g, '-')}-canon.json`);

  // Remove stale file
  if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);

  runAgent('Auditor', 'agents/auditor.md', {
    module_path: target.truthPath,
    output_file: outputFile,
    arch_file: ARCH_DOC,
    modules_file: MOD_DOC,
  });

  checkFileExists(outputFile, 'Auditor');
  return outputFile;
}

function stageCritic(target: Target, canonFile: string): string {
  console.info(`\u2696\ufe0f  Critiquing ${target.name}...`);
  const outputFile = path.join(TMP_DIR, `${target.name.replace(/\s+/g, '-')}-drift.md`);

  const skillPath = target.skillPath;
  const docPath = path.join(skillPath, 'SKILL.md');

  if (fs.existsSync(outputFile)) fs.unlinkSync(outputFile);

  runAgent('Critic', 'agents/critic.md', {
    audit_file: canonFile,
    doc_file: docPath,
    skill_dir: skillPath,
    output_file: outputFile,
    arch_file: ARCH_DOC,
    modules_file: MOD_DOC,
  });

  checkFileExists(outputFile, 'Critic');
  return outputFile;
}

function stageInstructor(
  target: Target,
  canonFile: string,
  reportFile: string,
  feedbackFile?: string,
) {
  console.info(`\u270d\ufe0f  Rewriting ${target.name}...`);
  const skillPath = target.skillPath;
  const docPath = path.join(skillPath, 'SKILL.md');

  // Instruction updates the file in place, so we don't need a specific output file param
  // other than what the prompt expects (target_file).
  // But we rely on the agent to do it.

  const args: Record<string, string> = {
    audit_file: canonFile,
    report_file: reportFile,
    target_file: docPath,
    skill_dir: skillPath,
    arch_file: ARCH_DOC,
    modules_file: MOD_DOC,
  };

  if (feedbackFile) {
    console.info(`  \u21aa With Gauntlet Feedback: ${feedbackFile}`);
    args.gauntlet_report_file = feedbackFile;
  }

  runAgent('Instructor', 'agents/instructor.md', args);

  // We can't easily verify change unless we check mtime or content hash,
  // but let's assume if it finished without error, it tried.
}

function stageGauntlet(target: Target): string {
  console.info(`\uD83E\uDDE4  Verifying ${target.name}...`);
  const statusFile = path.join(TMP_DIR, `${target.name.replace(/\s+/g, '-')}-status.txt`);

  const skillPath = target.skillPath;
  const docPath = path.join(skillPath, 'SKILL.md');

  if (fs.existsSync(statusFile)) fs.unlinkSync(statusFile);

  runAgent('Gauntlet', 'agents/gauntlet.md', {
    doc_file: docPath,
    test_module: target.truthPath,
    skill_dir: skillPath,
    status_file: statusFile,
  });

  const status = checkFileExists(statusFile, 'Gauntlet');

  if (status.includes('FAILED')) {
    console.error(`\u274C  Gauntlet Check FAILED for ${target.name}`);
    // console.error(status); // Optional: print full status
    return status;
  } else {
    console.info(`\u2705  Gauntlet Check PASSED`);
    return 'PASSED';
  }
}

// --- Main Loop ---

function loadState(): string[] {
  if (fs.existsSync(STATE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    } catch {
      return [];
    }
  }
  return [];
}

function saveState(completedTargets: string[]) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(completedTargets, null, 2));
}

async function main() {
  ensureTmpDir();
  const allTargets = getTargets();
  const completedTargets = loadState();

  // Filter out completed targets
  const targets = allTargets.filter((t) => !completedTargets.includes(t.name));

  console.info(`\uD83D\uDE80 Starting Skill Refinement Loop.`);
  console.info(
    `Total Skills: ${allTargets.length} | Completed: ${completedTargets.length} | Remaining: ${targets.length}`,
  );
  console.info(`Models: [${MODELS}]`);

  for (const target of targets) {
    console.info(`\n--- Refinement Target: ${target.name} ---`);
    console.info(`Truth Path: ${target.truthPath}`);
    try {
      // 1. Auditor
      const canonFile = stageAuditor(target);

      // 2. Critic
      const driftFile = stageCritic(target, canonFile);

      // 3. Instructor (Initial Pass)
      stageInstructor(target, canonFile, driftFile);

      // 4. Gauntlet / Instructor Loop
      const MAX_RETRIES = 5;
      let attempts = 0;
      let success = false;

      while (attempts < MAX_RETRIES) {
        const status = stageGauntlet(target);

        if (status.includes('PASSED')) {
          success = true;
          break;
        }

        attempts++;
        if (attempts < MAX_RETRIES) {
          console.info(
            `\u26A0\ufe0f  Gauntlet Failed (Attempt ${attempts}/${MAX_RETRIES}). Looping back to Instructor...`,
          );

          // The status file contains the feedback
          const statusFile = path.join(TMP_DIR, `${target.name.replace(/\s+/g, '-')}-status.txt`);

          // Call Instructor with feedback
          stageInstructor(target, canonFile, driftFile, statusFile);
        }
      }

      if (!success) {
        console.error(`\u274C  Final: ${target.name} FAILED after ${MAX_RETRIES} attempts.`);
        // We do NOT mark as completed if failed
      } else {
        console.info(`\u2728  Final: ${target.name} REFINED successfully.`);
        completedTargets.push(target.name);
        saveState(completedTargets);
      }
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      console.error(`\uD83D\uDCA5 Error processing ${target.name}:`, message);
      if (message.includes('429') || message.includes('exhausted')) {
        console.error('Capacity exhausted. Exiting to preserve state.');
        process.exit(1);
      }
    }
  }

  // If all done, cleanup
  if (completedTargets.length === allTargets.length) {
    console.info(`\n\u2728 All targets successfully processed. Cleaning up state.`);
    if (fs.existsSync(STATE_FILE)) fs.unlinkSync(STATE_FILE);
  } else {
    console.info(
      `\n\u23F8  Loop finished. ${completedTargets.length}/${allTargets.length} completed.`,
    );
  }
}

main();
