import { mc, tf, matching, shortAnswer, openText, audioResponse } from '../lib/import-helpers.mjs'

const IMG = '/tmp/variant5_extract/word/media'
const AUDIO = '/Users/nursultan/Desktop/work/example/test/variant 5'
const img = (n) => `${IMG}/image${n}.png`
const a = {
  part1: `${AUDIO}/listening part 1.mp3`,
  part2: `${AUDIO}/listening part 2.mp3`,
  part3: `${AUDIO}/Listening part 3.mp3`,
  part4: `${AUDIO}/listening part 4.mp3`,
}

// NOTE: this source file is the old reused "A1 with answers.docx" — its
// trailing "ANSWERS" appendix turned out to be 100% stale leftovers from
// variants 1–4 (verified: text matches their passages verbatim), not real
// answers for this variant's actual content. No reliable answer key exists
// anywhere in the file for Listening Part 3 (matching) or Reading Part 1
// (picture true/false), so both are imported as manually-graded rather than
// risk inserting a guessed — and possibly wrong — auto-grade key.
const matchOptionsUnverified = () => ({
  options: [
    { id: 'a', label: 'A', image: img(6) }, { id: 'b', label: 'B', image: img(7) }, { id: 'c', label: 'C', image: img(8) },
    { id: 'd', label: 'D', image: img(9) }, { id: 'e', label: 'E', image: img(10) },
  ],
})

// matching() always auto-grades; build a manually-graded picture-choice
// question directly via mc() with no `correct` (mc still needs one, so we
// borrow shortAnswer's manual-grading shape but keep the image options).
function matchingManual({ text, audio }) {
  return {
    question_type: 'matching',
    points: 1,
    image: null,
    audio,
    content: { text, options: matchOptionsUnverified().options },
    optionImages: true,
    requiresManual: true,
  }
}

export default {
  id: crypto.randomUUID(),
  name: 'A2 — Нұсқа 5',
  level: 'A2',
  sections: {
    listening: [
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(1), audio: a.part1, correct: false }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(2), audio: a.part1, correct: true }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(3), audio: a.part1, correct: false }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(4), audio: a.part1, correct: true }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(5), audio: a.part1, correct: false }),

      mc({ text: 'What is wrong with him?', audio: a.part2, options: [{ id: 'a', label: 'He has a headache' }, { id: 'b', label: 'He has a toothache' }, { id: 'c', label: 'He has an earache' }], correct: 'a' }),
      mc({ text: 'What is wrong with him?', audio: a.part2, options: [{ id: 'a', label: 'He lost his money' }, { id: 'b', label: 'He is ill' }, { id: 'c', label: 'He is hungry' }], correct: 'b' }),
      mc({ text: 'Where are they?', audio: a.part2, options: [{ id: 'a', label: 'School' }, { id: 'b', label: 'Playground' }, { id: 'c', label: 'Hospital' }], correct: 'c' }),
      mc({ text: 'Who is speaking?', audio: a.part2, options: [{ id: 'a', label: 'Girl' }, { id: 'b', label: 'Boy' }, { id: 'c', label: 'Boy and girl' }], correct: 'b' }),
      mc({ text: 'What happened?', audio: a.part2, options: [{ id: 'a', label: "Didn't sleep" }, { id: 'b', label: "Didn't work" }, { id: 'c', label: "Didn't play" }], correct: 'a' }),

      matchingManual({ text: 'Listen to short talk 1. Which picture matches it?', audio: a.part3 }),
      matchingManual({ text: 'Listen to short talk 2. Which picture matches it?', audio: a.part3 }),
      matchingManual({ text: 'Listen to short talk 3. Which picture matches it?', audio: a.part3 }),
      matchingManual({ text: 'Listen to short talk 4. Which picture matches it?', audio: a.part3 }),
      matchingManual({ text: 'Listen to short talk 5. Which picture matches it?', audio: a.part3 }),

      mc({ text: 'Sara wants to buy an apple. It is 200 tenge. She has 100 tenge. How much more money does she need?', audio: a.part4, options: [{ id: 'a', label: '100 tenge' }, { id: 'b', label: '200 tenge' }, { id: 'c', label: '300 tenge' }], correct: 'a' }),
      mc({ text: 'A boy wants to ride his bike, but the bike is broken. What does he need to do?', audio: a.part4, options: [{ id: 'a', label: 'Ride the bike' }, { id: 'b', label: 'Fix the bike' }, { id: 'c', label: 'Find the bike' }], correct: 'b' }),
      mc({ text: 'Dana is at the cinema. There are people in front of her. She wants to buy a ticket. What does she need to do?', audio: a.part4, options: [{ id: 'a', label: 'Argue' }, { id: 'b', label: 'Get angry' }, { id: 'c', label: 'Wait' }], correct: 'c' }),
      mc({ text: 'A boy has three balloons. The wind blows them away. Where are the balloons now?', audio: a.part4, options: [{ id: 'a', label: 'At home' }, { id: 'b', label: 'In the sky' }, { id: 'c', label: 'In the car' }], correct: 'b' }),
      mc({ text: 'Miras wants to open the door, but he cannot find his key. What is he looking for?', audio: a.part4, options: [{ id: 'a', label: 'His car' }, { id: 'b', label: 'His brother' }, { id: 'c', label: 'His key' }], correct: 'c' }),
    ],

    reading: [
      // No reliable answer key survived for this section in the source file — manual grading (see note above).
      shortAnswer({ text: 'Look at the picture. Is the sentence correct? The girl is having lunch with friends at the café.', image: img(11) }),
      shortAnswer({ text: 'Look at the picture. Is the sentence correct? This is a bus stop. The boy is waiting for the bus outside.', image: img(12) }),
      shortAnswer({ text: 'Look at the picture. Is the sentence correct? Grandfather and grandson are picking up apples. He is happy.', image: img(13) }),
      shortAnswer({ text: 'Look at the picture. Is the sentence correct? The family is in a cable car. They are going up the mountain and can see the city below.', image: img(14) }),
      shortAnswer({ text: 'Look at the picture. Is the sentence correct? The girl is playing in the snow with her friends. They are making a snowman.', image: img(15) }),

      ...(() => {
        const passage =
          "Last Saturday, Amina went to Kok Tobe with her family. They left home at 10 o'clock in the morning. They went there by cable car. Amina was very excited because it was her first time on a cable car. The weather was warm and sunny. At Kok Tobe, they walked around and took many photos. Amina and her little brother ate ice cream. Their parents drank tea at a small café. They could see the city and the mountains from the top. In the evening, they went home by bus. Amina was tired but very happy."
        return [
          mc({ text: `${passage}\n\nWhere did Amina go?`, options: [{ id: 'a', label: 'Medeu' }, { id: 'b', label: 'Kok Tobe' }, { id: 'c', label: 'School' }], correct: 'b' }),
          mc({ text: `${passage}\n\nWhy was Amina excited?`, options: [{ id: 'a', label: 'It was her first time on a cable car' }, { id: 'b', label: 'She bought a new bag' }, { id: 'c', label: 'She met her teacher' }], correct: 'a' }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'Amina went to Kok Tobe with her friends.', correct: false }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'The weather was warm and sunny.', correct: true }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'Amina and her brother ate ice cream.', correct: true }),
          shortAnswer({ text: `${passage}\n\nWhat did Amina's parents drink?` }),
          shortAnswer({ text: `${passage}\n\nHow did the family go home?` }),
        ]
      })(),

      ...(() => {
        const letter =
          "Hi Arman,\nI cannot go to the cinema with you today because I need to help my father. We are fixing my bicycle. It is old, but I like it very much. Can we go to the cinema on Saturday? The new film starts at 4 o'clock.\nSee you soon!\nBest wishes, Dias"
        return [
          shortAnswer({ text: `${letter}\n\nWhy can't Dias go to the cinema today?` }),
          shortAnswer({ text: `${letter}\n\nWhat are they fixing?` }),
          shortAnswer({ text: `${letter}\n\nWhen does Dias want to go to the cinema?` }),
          shortAnswer({ text: `${letter}\n\nWhat time does the film start?` }),
        ]
      })(),

      ...(() => {
        const timetable =
          'School Activity Club – Almaty\nMonday: English Club – 3:00 p.m.\nTuesday: Art Club – 4:00 p.m.\nThursday: Chess Club – 3:30 p.m.\nFriday: Music Club – 4:30 p.m.\nPlace: School Library'
        return [
          shortAnswer({ text: `${timetable}\n\nWhen is the English Club?` }),
          shortAnswer({ text: `${timetable}\n\nWhat club is on Tuesday?` }),
          shortAnswer({ text: `${timetable}\n\nWhat time does the Chess Club start?` }),
          shortAnswer({ text: `${timetable}\n\nWhere do the students meet?` }),
        ]
      })(),
    ],

    writing: [
      openText({
        text: 'Write about your weekend. Answer the questions: Where do you usually go at the weekend? Who do you go with? What do you usually do there? What do you like about your weekend? Write 4–5 sentences.',
        placeholder: 'At the weekend I usually...',
      }),
      openText({
        text: 'Look at the picture and write about it (5–6 sentences). Use the words: There is / There are ..., I can see ..., The boy/girl is ..., They are ..., in, on, under, next to, near ...',
        image: img(16),
        placeholder: 'I can see...',
      }),
    ],

    speaking: [
      audioResponse({
        text: 'Personal questions. Answer: What do you usually do at the weekend? What is your favourite place in your city? Who do you usually go there with? What do you like to eat for lunch? What do you do when the weather is sunny?',
      }),
      audioResponse({
        text: 'Look at the picture and talk about it. Use: Where are the people? Who can you see? What are they doing? What food can you see? What do you usually eat at school?',
        image: img(17),
      }),
    ],
  },
}
