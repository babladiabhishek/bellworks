# Exercise video sources

Each movement has an explicit YouTube video ID in `exercise-videos.js`. These are exercise demonstrations or focused tutorials, selected for the programmed equipment and variation. Channel size varies; this is a curated selection, not a popularity ranking or an endorsement by the creators.

Titles and channel attribution were checked against YouTube’s oEmbed endpoint on 2026-09-07. All 18 selected videos were then verified playing through the local app’s embedded player in Chromium in Sweden: a loaded video, active playback, and advancing playback time. The recorded results are in [scripts/video-verification.json](scripts/video-verification.json). Availability can change by region, account or creator settings.

The goblet-squat tutorial starts at 2:00, at its setup chapter. Other videos start at the beginning. Native YouTube controls support pausing, seeking, playback speed, captions when available, and fullscreen.

| Movement | Video | Channel | Length |
| --- | --- | --- | --- |
| goblet-squat | [Goblet Squat Essentials for Muscle & Strength](https://www.youtube.com/watch?v=xTM-e_Gj5sA) | Onnit | 19:42 |
| oh-press | [Single Arm Kettlebell Press Exercise | Onnit Tutorial](https://www.youtube.com/watch?v=gjr-QAdsq4o) | Onnit | 0:21 |
| floor-press | [Single Arm Kettlebell Floor Press](https://www.youtube.com/watch?v=ULSq3zY9gt4) | STRONG ATHLETE | 0:40 |
| rev-lunge | [Kettlebell Goblet Reverse Lunge Exercise | Onnit Tutorial](https://www.youtube.com/watch?v=gWN9epxFqX8) | Onnit | 0:22 |
| tri-ext | [Kettlebell Overhead Triceps Extension](https://www.youtube.com/watch?v=55ynz3DR-xA) | Testosterone Nation | 0:37 |
| farmer-carry | [How To Do Kettlebell Farmers Walk | Exercise Demo](https://www.youtube.com/watch?v=sZAx0TVLwPI) | OriGym | 0:48 |
| kb-deadlift | [Kettlebell Deadlift | Exercise Tutorial](https://www.youtube.com/watch?v=l6gDwf3xC6s) | Onnit | 0:15 |
| gorilla-row | [How To Do A KETTLEBELL GORILLA ROW | Exercise Demonstration Video and Guide](https://www.youtube.com/watch?v=bLM3nLvoRdc) | Live Lean TV Daily Exercises | 0:42 |
| swing | [Kettlebell Swing](https://www.youtube.com/watch?v=1cVT3ee9mgU) | StrongFirst | 0:27 |
| pullover | [Kettlebell Floor Pullover for Bigger Lats](https://www.youtube.com/watch?v=hbiDlO7VBxs) | Pro Kettlebell | 1:54 |
| curl | [Kettlebell bicep curl // two handed horns up kettlebell curl // Kettlebell bicep curl exercises](https://www.youtube.com/watch?v=mPiTdI_FcOY) | HYROX HUB | 0:05 |
| suitcase-carry | [How To Do Kettlebell Suitcase Carry | Exercise Demo](https://www.youtube.com/watch?v=iq5D5SU2Oq4) | OriGym | 0:19 |
| clean-press | [How To Do a Kettlebell Clean to Press](https://www.youtube.com/watch?v=km3f8_rpDdg) | National Academy of Sports Medicine (NASM) | 0:26 |
| front-squat | [Single Arm Kettlebell Front Squat Exercise | Onnit Tutorial](https://www.youtube.com/watch?v=OkJNQiPJjBk) | Onnit | 0:22 |
| pushup | [Kettlebell Handle Push Up](https://www.youtube.com/watch?v=25RMyEBywow) | Stack 52 | 0:12 |
| sl-rdl | [How to perform the kettlebell single leg deadlift](https://www.youtube.com/watch?v=CohgHMsoS2s) | Human Kinetics | 1:50 |
| renegade-row | [How to do a Kettlebell Renegade Row](https://www.youtube.com/watch?v=NNTpBlHRcA4) | National Academy of Sports Medicine (NASM) | 0:13 |
| rack-carry | [Single Arm Kettlebell Front Rack Carry | CrossFit Invictus](https://www.youtube.com/watch?v=eJCc5tjQjk0) | CrossFit Invictus | 0:09 |

## Delivery

The app embeds the original videos through YouTube’s privacy-enhanced player and displays YouTube-hosted thumbnails. It does not download, rehost or edit the videos. The original player, branding, attribution and a direct watch link are retained. Video playback needs an internet connection; exercise instructions and workout tracking remain usable when playback is unavailable.

Integration references: [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference), [embedded-player parameters](https://developers.google.com/youtube/player_parameters), and [YouTube embedding help](https://support.google.com/youtube/answer/171780).

Two initial candidates were replaced after live embed checks returned an unavailable error: `UudX6rKBi7c` (goblet squat) and `E7WRJtfsiO4` (clean and press). A successful oEmbed response alone does not verify playback.
