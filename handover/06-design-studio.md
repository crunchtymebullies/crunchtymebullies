# 06 — AI Design Studio (MUSE)

Admin-only at `/go/design-studio`. Generates merch artwork with AI and one-click publishes products. Brain: `lib/muse.ts` + `lib/design-intelligence.ts`; AI on **fal.ai** (`FAL_API_KEY`). Guided wizards for non-tech staff.

## What staff can do
Generate art (many styles) → place on a product (drag/scale/rotate) → preview a Printful mockup → set price → publish. Also: all-over-print wraps, conversational edits ("make it gold"), element extract, recolor, text/typography, coordinated drops, train AI on your dogs/style (LoRA), and hype reels (short videos).

## UI files (`app/go/design-studio/`)
`page.tsx` (hub), `Muse.tsx`, `DesignFlow.tsx`, `PlacementEditor.tsx` (react-konva), `MockupPreview.tsx`, `WrapStudio.tsx`, `WrapWizard.tsx`, `PrintWizard.tsx`, `EditStudio.tsx`, `RecolorStudio.tsx`, `TextStudio.tsx`, `DropComposer.tsx`, `TrainStudio.tsx`, `ReelStudio.tsx`, `LibraryView.tsx`, `ProjectsView.tsx`, `Tutorial.tsx`, `ColorPickSheet.tsx`, `PriceRow.tsx`, `designOptions.ts`, `useProject.ts`.

## Brain (`lib/muse.ts`)
Brand DNA, finishes, art styles + functions: developConcept/proposePalette/planDrop (AI language model), museGenerate/proGenerate/referenceGenerate/loraGenerate (FLUX/Recraft/FLUX.2/LoRA), kontextEdit, samExtract, scoreDesign/critiqueMockup (vision), upscaleForPrint/upscaleTransparent, applyVibrancy, submit/poll LoRA + reels, getTasteDigest/recordTaste (taste memory).

## fal.ai models
FLUX 1.1 pro/ultra/dev/schnell, Recraft v3, FLUX.2 pro edit, FLUX Kontext, EVF-SAM, BiRefNet, Clarity upscaler, Kling v2.1 (reels), flux-lora-fast-training, an AI language model (via any-llm) for briefs/scoring.

## API routes
`app/api/go/design/*` (generate, brief, compose, upload, wrap, recolor, mockup, publish, logo-extract, logo-place, library, projects, price-suggest). `app/api/go/muse/*` (concept, palette, generate, drop, edit, extract, fanout, train + train/status, reel + reel/status).

## Jobs & data
Training + reels use fal queue + polling; self-heal on next visit + daily cron `/api/cron/sweep` (8am). Supabase tables: `designs`, `design_projects` (+versions), `lora_models`, `muse_reels`, `taste_events`.

## Publish & cost
Publish → creates Medusa product + Printful sync → appears in `/shop`. Assets in Sanity; records in Supabase. fal.ai pay-as-you-go (~$0.025/img dev). Pending: dog LoRA not trained yet (upload 10–20 dog photos → Train MUSE → Your dogs).
