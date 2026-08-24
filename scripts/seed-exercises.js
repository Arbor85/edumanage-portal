#!/usr/bin/env node
// Run with: node scripts/seed-exercises.js
// Requires Node.js 18+ (built-in fetch)

import { writeFile, mkdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');

const DATASET_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main';
const EXERCISES_JSON_URL = `${DATASET_BASE}/data/exercises.json`;
const IMAGES_OUT_DIR = join(REPO_ROOT, 'modern', 'public', 'images', 'exercises');
const SEED_JSON_OUT = join(REPO_ROOT, 'netbackend', 'src', 'EduManage.Infrastructure', 'gym_exercises_full.json');

const ACTIVITY_TYPE = { Weighted: 0, Machine: 1, Bodyweight: 2, Cardio: 3 };
const TRACK_TYPE = { Repetitions: 0, Time: 1, Distance: 2 };

function inferActivityType(exercise) {
  if (exercise.body_part === 'cardio') return ACTIVITY_TYPE.Cardio;
  const eq = (exercise.equipment ?? '').toLowerCase();
  if (eq === 'body weight' || eq === 'band' || eq === 'bosu ball') return ACTIVITY_TYPE.Bodyweight;
  if (eq.includes('machine') || eq.includes('cable') || eq.includes('lever')) return ACTIVITY_TYPE.Machine;
  return ACTIVITY_TYPE.Weighted;
}

function inferTrackType(exercise) {
  if (exercise.body_part === 'cardio') return TRACK_TYPE.Time;
  return TRACK_TYPE.Repetitions;
}

function toMuscleRecords(primary, secondaries) {
  const all = [primary, ...secondaries].filter(Boolean);
  const seen = new Set();
  return all
    .filter(m => { const k = m.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; })
    .map(name => ({ Name: name }));
}

async function fileExists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function downloadFile(url, destPath) {
  if (await fileExists(destPath)) return false;
  const res = await fetch(url);
  if (!res.ok) return false;
  const buf = Buffer.from(await res.arrayBuffer());
  await writeFile(destPath, buf);
  return true;
}

async function main() {
  await mkdir(IMAGES_OUT_DIR, { recursive: true });

  console.log('Fetching exercises.json...');
  const res = await fetch(EXERCISES_JSON_URL);
  if (!res.ok) throw new Error(`Failed to fetch exercises: ${res.status}`);
  const exercises = await res.json();
  console.log(`Found ${exercises.length} exercises.`);

  const seedRecords = [];
  let downloaded = 0;
  let skipped = 0;

  for (let i = 0; i < exercises.length; i++) {
    const ex = exercises[i];
    const imageFilename = ex.image ? ex.image.replace('images/', '') : null;
    const gifFilename = ex.gif_url ? ex.gif_url.replace('videos/', '') : null;

    let imagePath = null;
    let gifPath = null;

    if (imageFilename) {
      const dest = join(IMAGES_OUT_DIR, imageFilename);
      const url = `${DATASET_BASE}/images/${imageFilename}`;
      const got = await downloadFile(url, dest);
      if (got) downloaded++; else skipped++;
      imagePath = `/images/exercises/${imageFilename}`;
    }

    if (gifFilename) {
      const dest = join(IMAGES_OUT_DIR, gifFilename);
      const url = `${DATASET_BASE}/videos/${gifFilename}`;
      const got = await downloadFile(url, dest);
      if (got) downloaded++; else skipped++;
      gifPath = `/images/exercises/${gifFilename}`;
    }

    const primary = ex.target ?? ex.muscle_group ?? '';
    const secondaries = Array.isArray(ex.secondary_muscles) ? ex.secondary_muscles : [];

    seedRecords.push({
      DatasetId: ex.id,
      Name: ex.name,
      ShortDescription: '',
      PrimaryMuscle: primary,
      SecondaryMuscles: secondaries,
      Muscles: toMuscleRecords(primary, secondaries),
      Tags: ex.level ? [ex.level] : [],
      ActivityType: inferActivityType(ex),
      ActivityTrackType: inferTrackType(ex),
      Instructions: Array.isArray(ex.instruction_steps?.en) ? ex.instruction_steps.en : [],
      Equipment: ex.equipment ?? null,
      Level: ex.level ?? null,
      Force: ex.force ?? null,
      Mechanic: ex.mechanic ?? null,
      Category: ex.category ?? ex.body_part ?? null,
      ImagePath: imagePath,
      GifPath: gifPath,
    });

    if ((i + 1) % 50 === 0 || i === exercises.length - 1) {
      process.stdout.write(`\r[${i + 1}/${exercises.length}] downloaded: ${downloaded}, skipped: ${skipped}   `);
    }
  }

  console.log('\nWriting seed JSON...');
  await writeFile(SEED_JSON_OUT, JSON.stringify(seedRecords, null, 2), 'utf8');
  console.log(`Done. Wrote ${seedRecords.length} exercises to gym_exercises_full.json`);
  console.log(`Images: ${downloaded} downloaded, ${skipped} already existed.`);
}

main().catch(err => { console.error(err); process.exit(1); });
