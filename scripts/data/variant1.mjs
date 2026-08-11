import { mc, tf, matching, shortAnswer, openText, audioResponse } from '../lib/import-helpers.mjs'

const IMG = '/tmp/variant1_extract/word/media'
const AUDIO = '/Users/nursultan/Desktop/work/example/test/Variant 1'
const JPEG_IMAGES = new Set([6, 17])
const img = (n) => `${IMG}/image${n}.${JPEG_IMAGES.has(n) ? 'jpeg' : 'png'}`
const a = {
  part1: `${AUDIO}/Listening PART 1.mp3`,
  part2: `${AUDIO}/LISTENING PART 2.mp3`,
  part3: `${AUDIO}/Listening part 3.mp3`,
  part4: `${AUDIO}/listening part 4.mp3`,
}

export default {
  id: crypto.randomUUID(),
  name: 'A2 — Нұсқа 1',
  level: 'A2',
  sections: {
    listening: [
      // Part 1 — word/sentence recognition (image + audio, tick/cross)
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(1), audio: a.part1, correct: true }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(2), audio: a.part1, correct: false }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(3), audio: a.part1, correct: true }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(4), audio: a.part1, correct: false }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(5), audio: a.part1, correct: true }),

      // Part 2 — short dialogues
      mc({ text: 'Where does she live?', audio: a.part2, options: [{ id: 'a', label: 'Astana' }, { id: 'b', label: 'Almaty' }, { id: 'c', label: 'Shymkent' }], correct: 'b' }),
      mc({ text: 'How old is he?', audio: a.part2, options: [{ id: 'a', label: '12' }, { id: 'b', label: '11' }, { id: 'c', label: '10' }], correct: 'a' }),
      mc({ text: 'How many sisters does she have?', audio: a.part2, options: [{ id: 'a', label: 'One' }, { id: 'b', label: 'Two' }, { id: 'c', label: 'Zero' }], correct: 'c' }),
      mc({ text: 'What is his favourite subject?', audio: a.part2, options: [{ id: 'a', label: 'Math' }, { id: 'b', label: 'English' }, { id: 'c', label: 'Science' }], correct: 'b' }),
      mc({ text: 'What time does she go to school?', audio: a.part2, options: [{ id: 'a', label: '8:00' }, { id: 'b', label: '8:30' }, { id: 'c', label: '9:00' }], correct: 'a' }),

      // Part 3 — match each of 5 short talks to a picture (A-E), one audio for all 5
      matching({
        text: 'Listen to short talk 1. Which picture matches it?', audio: a.part3,
        options: [
          { id: 'a', label: 'A', image: img(6) }, { id: 'b', label: 'B', image: img(7) }, { id: 'c', label: 'C', image: img(8) },
          { id: 'd', label: 'D', image: img(9) }, { id: 'e', label: 'E', image: img(10) },
        ], correct: 'c',
      }),
      matching({
        text: 'Listen to short talk 2. Which picture matches it?', audio: a.part3,
        options: [
          { id: 'a', label: 'A', image: img(6) }, { id: 'b', label: 'B', image: img(7) }, { id: 'c', label: 'C', image: img(8) },
          { id: 'd', label: 'D', image: img(9) }, { id: 'e', label: 'E', image: img(10) },
        ], correct: 'a',
      }),
      matching({
        text: 'Listen to short talk 3. Which picture matches it?', audio: a.part3,
        options: [
          { id: 'a', label: 'A', image: img(6) }, { id: 'b', label: 'B', image: img(7) }, { id: 'c', label: 'C', image: img(8) },
          { id: 'd', label: 'D', image: img(9) }, { id: 'e', label: 'E', image: img(10) },
        ], correct: 'd',
      }),
      matching({
        text: 'Listen to short talk 4. Which picture matches it?', audio: a.part3,
        options: [
          { id: 'a', label: 'A', image: img(6) }, { id: 'b', label: 'B', image: img(7) }, { id: 'c', label: 'C', image: img(8) },
          { id: 'd', label: 'D', image: img(9) }, { id: 'e', label: 'E', image: img(10) },
        ], correct: 'b',
      }),
      matching({
        text: 'Listen to short talk 5. Which picture matches it?', audio: a.part3,
        options: [
          { id: 'a', label: 'A', image: img(6) }, { id: 'b', label: 'B', image: img(7) }, { id: 'c', label: 'C', image: img(8) },
          { id: 'd', label: 'D', image: img(9) }, { id: 'e', label: 'E', image: img(10) },
        ], correct: 'e',
      }),

      // Part 4 — situational problem-solving
      mc({ text: 'What does Nurlan need?', audio: a.part4, options: [{ id: 'a', label: 'A T-shirt' }, { id: 'b', label: 'A hat' }, { id: 'c', label: 'Sandals' }], correct: 'b' }),
      mc({ text: 'What did she forget to take?', audio: a.part4, options: [{ id: 'a', label: 'An umbrella' }, { id: 'b', label: 'A book' }, { id: 'c', label: 'Sunglasses' }], correct: 'a' }),
      mc({ text: 'What time did the lesson start?', audio: a.part4, options: [{ id: 'a', label: '9:00' }, { id: 'b', label: '9:15' }, { id: 'c', label: '8:30' }], correct: 'a' }),
      mc({ text: 'Why is Daryn worried?', audio: a.part4, options: [{ id: 'a', label: 'Because he is sick' }, { id: 'b', label: 'Because he did not study for the test' }, { id: 'c', label: 'Because he lost his bag' }], correct: 'b' }),
      mc({ text: "Who is Asan's father?", audio: a.part4, options: [{ id: 'a', label: 'A teacher' }, { id: 'b', label: 'A driver' }, { id: 'c', label: 'A doctor' }], correct: 'c' }),
    ],

    reading: [
      // Part 1 — visual recognition (image + statement, true/false)
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'This is Kazakh traditional house yurt.', image: img(11), correct: true }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'The men are playing football.', image: img(12), correct: false }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'This is Baiterek which is a symbol of modern Kazakhstan.', image: img(13), correct: true }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'The family is drinking tea.', image: img(14), correct: false }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'The children are playing in the snow.', image: img(15), correct: false }),

      // Part 2 — text comprehension (same passage on every question)
      ...(() => {
        const passage =
          "Last Saturday, our class went to the mountains near Almaty. We left school at 8 o'clock and went there by bus. The weather was cold but sunny. Our teacher told us about the mountains, and we listened carefully. After that, we took photos and ate lunch together. Some students played in the snow, but I do not like cold weather. I was so happy because I was with my friends. We returned to school at 4 o'clock. It was a very interesting day."
        return [
          mc({ text: `${passage}\n\nWhere do they go?`, options: [{ id: 'a', label: 'Astana' }, { id: 'b', label: 'The mountains' }, { id: 'c', label: 'Turkistan' }], correct: 'b' }),
          mc({ text: `${passage}\n\nHow do they go there?`, options: [{ id: 'a', label: 'By car' }, { id: 'b', label: 'By bus' }, { id: 'c', label: 'On foot' }], correct: 'b' }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'They leave at 9 o’clock.', correct: false }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'The weather is warm and rainy.', correct: false }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'The writer likes cold weather.', correct: false }),
          shortAnswer({ text: `${passage}\n\nWhy is the writer happy?` }),
          shortAnswer({ text: `${passage}\n\nWhat time do they return to school?` }),
        ]
      })(),

      // Part 3 — short message reading
      ...(() => {
        const letter =
          'Hi Arman,\nI cannot come to school today because I am sick. I have a headache and need to stay at home. Please send me the homework after the lesson. Our English test is tomorrow, so I am worried. Thank you!\nAruzhan'
        return [
          shortAnswer({ text: `${letter}\n\nWhy is Aruzhan not at school?` }),
          shortAnswer({ text: `${letter}\n\nWhat does she ask Arman to do?` }),
          shortAnswer({ text: `${letter}\n\nWhen is the English test?` }),
          shortAnswer({ text: `${letter}\n\nIs she relaxed or worried?` }),
        ]
      })(),

      // Part 4 — timetable comprehension
      ...(() => {
        const timetable =
          'Almaty City Library\nMonday – Friday: 9:00–18:00\nSaturday: 10:00–15:00\nSunday: Closed\nChildren’s English Club: Saturday at 11:00, Place: Room 3'
        return [
          shortAnswer({ text: `${timetable}\n\nIs the library open on Sunday?` }),
          shortAnswer({ text: `${timetable}\n\nWhat time does it open on Monday?` }),
          shortAnswer({ text: `${timetable}\n\nWhen is the English Club?` }),
          shortAnswer({ text: `${timetable}\n\nWhere does it take place?` }),
        ]
      })(),
    ],

    writing: [
      openText({
        text: 'Write about your weekend. Answer these questions: Where did you go? Who were you with? What did you do? Did you like it?',
        placeholder: 'My weekend...',
      }),
      openText({
        text: 'Look at the picture. Write a short text according to the photo. Use: There is / There are, They are…, The father…., I can see …',
        image: img(16),
        placeholder: 'I can see...',
      }),
    ],

    speaking: [
      audioResponse({
        text: 'Personal information. Answer: What is your name? How old are you? Where do you live? What is your favourite subject? How many people are in your family?',
      }),
      audioResponse({
        text: 'Describe the picture. Who can you see? What are they doing? Where are they?',
        image: img(17),
      }),
    ],
  },
}
