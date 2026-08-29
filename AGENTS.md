# EnglishForMom

## Project Overview

EnglishForMom is a mobile English-learning application built primarily for a Romanian-speaking beginner learning practical everyday English.

The initial user is an adult beginner who needs useful English for real daily situations rather than academic English.

The application should begin with vocabulary and actions encountered inside the home, then gradually expand into common verbs, sentence patterns, questions, conversations, and situations outside the home.

The app should prioritize practical comprehension, listening, repetition, and usable sentences.

## Primary Learning Philosophy

Do not teach isolated vocabulary only.

Whenever practical, teach:

1. the English word or phrase
2. the Romanian meaning
3. audio pronunciation
4. one or more practical examples
5. comprehension practice
6. repetition
7. review later

Example:

English:

`fridge`

Romanian:

`frigider`

Example:

`The milk is in the fridge.`

Romanian:

`Laptele este în frigider.`

Words should repeatedly appear in later lessons so the learner encounters them in multiple contexts.

## Initial Course Structure

### Level 1 — My Home

Topics may include:

* Kitchen
* Bathroom
* Bedroom
* Living Room
* Laundry
* Cleaning
* Around the House

Examples of vocabulary:

* fridge
* stove
* oven
* sink
* plate
* bowl
* cup
* spoon
* fork
* knife
* table
* chair
* bed
* pillow
* blanket
* towel
* shower
* toilet
* washing machine
* dryer
* vacuum
* broom
* mop

### Level 2 — Everyday Actions

Teach high-frequency verbs such as:

* be
* have
* do
* go
* come
* take
* bring
* give
* put
* get
* make
* eat
* drink
* cook
* wash
* clean
* open
* close
* sit
* stand
* sleep
* wake up
* walk
* wait
* look
* see
* hear
* speak
* say
* want
* need
* like
* know

Each verb should include multiple practical examples.

Example:

`put = a pune`

Examples:

* `Put the cup on the table.`
* `I put the food in the fridge.`
* `Where did you put my phone?`

### Level 3 — Basic Sentence Patterns

Examples:

* I am...
* I have...
* I want...
* I need...
* I like...
* I don't like...
* I can...
* I can't...
* I am going...
* I am making...
* I am cleaning...
* Can you...?
* Do you...?
* Where is...?
* What is...?
* Who is...?
* When...?
* Why...?
* How...?

### Later Levels

Later content may include:

* Grocery shopping
* Restaurants
* Doctor
* Pharmacy
* Driving
* Church
* Visiting family
* Phone calls
* Appointments
* Banking
* Work
* Airport
* Travel
* Small talk

Do not implement all later content during the MVP.

## Technology

Use:

* React Native
* Expo
* TypeScript
* Expo Router
* Git
* GitHub

The project should remain compatible with iOS and Android.

The initial development target is iPhone.

## Architecture

Use a clean feature-oriented structure.

Prefer approximately:

```text
app/
    _layout.tsx
    index.tsx
    learn/
    review/
    progress/

src/
    components/
    features/
        lessons/
        review/
        progress/
        audio/
    data/
        courses/
        lessons/
        vocabulary/
    hooks/
    services/
    storage/
    types/
    utils/
    constants/

assets/
    audio/
    images/
    icons/
```

Do not reorganize the entire project without a clear reason.

## Data-Driven Lesson System

Lesson content must not be hardcoded directly into screen components.

Lessons should be represented as typed data.

Use TypeScript types/interfaces for lesson data.

A lesson may contain activities such as:

* vocabulary introduction
* phrase introduction
* listening
* multiple choice
* English-to-Romanian matching
* Romanian-to-English matching
* sentence building
* fill in the blank
* speaking/repetition
* review

The lesson engine should render activities based on lesson data.

The intention is that future lessons can be added mostly by creating lesson data rather than building new UI.

## Example Lesson Concept

A kitchen lesson could contain:

```text
Vocabulary:
fridge
stove
sink
plate
cup

Examples:
The milk is in the fridge.
The pot is on the stove.
Wash the plate in the sink.
Put the cup on the table.
```

The same vocabulary should later reappear in verb and sentence lessons.

## Romanian Language Usage

Romanian should be used when explaining English concepts to the learner.

Romanian text must use proper Romanian diacritics where appropriate:

* ă
* â
* î
* ș
* ț

Do not use phonetic Romanian spellings as a replacement for proper audio pronunciation.

A pronunciation hint system may later be added, but it must remain secondary to actual English audio.

## User Experience

The UI should be extremely simple and readable.

Design for an adult beginner.

Prioritize:

* large text
* large touch targets
* clear navigation
* minimal clutter
* obvious buttons
* strong visual hierarchy
* easy return to the previous screen
* no unnecessary gestures
* no confusing icon-only actions

Avoid childish visual design.

The app can be friendly and visually pleasant without looking like a children's application.

## Home Screen

The eventual home screen should provide clear access to:

* Continue Learning
* Lessons
* Review
* Progress

Do not overcrowd the first version.

## Lesson Flow

A typical lesson should roughly follow:

1. Introduce vocabulary or concept
2. Show Romanian meaning
3. Allow English pronunciation playback
4. Show practical sentence examples
5. Ask simple comprehension questions
6. Ask recall questions
7. Complete lesson
8. Save progress
9. Schedule missed or difficult items for review

## Progress

Initially store progress locally.

Track at minimum:

* completed lessons
* current lesson
* activity results
* incorrect answers
* vocabulary familiarity
* last practiced date

Do not add accounts, authentication, cloud sync, or backend infrastructure during the initial MVP unless explicitly requested.

## Review System

Incorrect answers should return in later review sessions.

Eventually implement lightweight spaced repetition.

Keep the first algorithm understandable and deterministic.

Do not introduce unnecessary machine learning.

## Audio

The architecture must support spoken English audio.

Audio playback should be separated behind a service/interface so implementation can change later.

Do not require online AI-generated speech for the MVP.

Where possible, design so prerecorded audio or device text-to-speech can be used.

## Speaking

Speaking/pronunciation practice is planned but should not block the initial lesson system.

Keep speaking features modular.

Do not build complex pronunciation scoring until the basic learning application is working.

## AI Features

AI conversation practice may be added later.

Do not introduce OpenAI API calls during the initial foundation unless explicitly requested.

Future AI capabilities may include:

* conversational roleplay
* adaptive explanations
* personalized practice
* generation of additional examples
* correction of simple learner responses

Any future AI integration must be separated behind a service layer.

## Offline-First

The core learning experience should work without an internet connection.

Core lessons and progress should be available locally.

Avoid adding network dependencies unless necessary.

## Development Rules

Before making changes:

1. Read this file.
2. Inspect the existing implementation.
3. Understand the current architecture.
4. Keep changes scoped to the requested task.

During implementation:

* Use TypeScript strictly.
* Avoid `any` unless there is a strong reason.
* Prefer small reusable components.
* Keep business logic outside presentation components where practical.
* Do not hardcode lesson content inside UI components.
* Do not add large third-party dependencies unnecessarily.
* Do not change package versions without a reason.
* Do not introduce a backend without explicit approval.
* Do not introduce authentication without explicit approval.
* Do not introduce monetization.
* Do not implement unrelated future features.
* Keep iOS and Android compatibility.
* Maintain accessible touch target sizes and readable text.
* Avoid overengineering.

After implementation:

1. Run available TypeScript/lint/test checks.
2. Fix errors caused by the change.
3. Summarize every file created or modified.
4. Report commands run.
5. Report any manual steps still required.
6. Clearly state anything that could not be verified.

## Git

Work incrementally.

Do not commit automatically unless explicitly asked.

Do not rewrite Git history.

Do not delete unrelated files.

Keep each feature suitable for a small, understandable commit.

## Current MVP Goal

The first usable version should contain:

* Home screen
* Course/lesson selection
* Kitchen vocabulary lesson
* Bathroom vocabulary lesson
* Bedroom vocabulary lesson
* Living room vocabulary lesson
* common household actions
* introductory common verbs
* example sentences
* simple quizzes
* lesson completion
* local progress
* review of incorrect answers
* English audio playback

Defer:

* accounts
* cloud saves
* subscriptions
* advertising
* social features
* leaderboards
* complicated gamification
* AI conversation
* advanced pronunciation scoring
* backend administration

The immediate objective is to create something genuinely useful for learning practical English every day.
