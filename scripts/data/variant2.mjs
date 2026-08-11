import { mc, tf, matching, shortAnswer, openText, audioResponse } from '../lib/import-helpers.mjs'

const IMG = '/tmp/variant2_extract/word/media'
const AUDIO = '/Users/nursultan/Desktop/work/example/test/variant 2'
const img = (n) => `${IMG}/image${n}.png`
const a = {
  part1: `${AUDIO}/Listening Part 1.mp3`,
  part2: `${AUDIO}/Listening Part 2.mp3`,
  part3: `${AUDIO}/Listening Part 3.mp3`,
  part4: `${AUDIO}/Listening Part 4.mp3`,
}

const matchOptions = (correct) => ({
  options: [
    { id: 'a', label: 'A', image: img(6) }, { id: 'b', label: 'B', image: img(7) }, { id: 'c', label: 'C', image: img(8) },
    { id: 'd', label: 'D', image: img(9) }, { id: 'e', label: 'E', image: img(10) },
  ],
  correct,
})

export default {
  id: crypto.randomUUID(),
  name: 'A2 — Нұсқа 2',
  level: 'A2',
  sections: {
    listening: [
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(1), audio: a.part1, correct: false }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(2), audio: a.part1, correct: true }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(3), audio: a.part1, correct: true }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(4), audio: a.part1, correct: false }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(5), audio: a.part1, correct: false }),

      mc({ text: 'Where does she live?', audio: a.part2, options: [{ id: 'a', label: 'Almaty' }, { id: 'b', label: 'Taraz' }, { id: 'c', label: 'Shymkent' }], correct: 'b' }),
      mc({ text: 'How old is he?', audio: a.part2, options: [{ id: 'a', label: '13 years old' }, { id: 'b', label: '12 years old' }, { id: 'c', label: '10 years old' }], correct: 'a' }),
      mc({ text: 'How many children does the woman have?', audio: a.part2, options: [{ id: 'a', label: 'One' }, { id: 'b', label: 'Two' }, { id: 'c', label: 'Three' }], correct: 'c' }),
      mc({ text: 'What is her favourite subject?', audio: a.part2, options: [{ id: 'a', label: 'History' }, { id: 'b', label: 'Math' }, { id: 'c', label: 'Art' }], correct: 'c' }),
      mc({ text: 'What time do the lessons start?', audio: a.part2, options: [{ id: 'a', label: '8:15' }, { id: 'b', label: '7:30' }, { id: 'c', label: '7:15' }], correct: 'a' }),

      matching({ text: 'Listen to short talk 1. Which picture matches it?', audio: a.part3, ...matchOptions('b') }),
      matching({ text: 'Listen to short talk 2. Which picture matches it?', audio: a.part3, ...matchOptions('a') }),
      matching({ text: 'Listen to short talk 3. Which picture matches it?', audio: a.part3, ...matchOptions('c') }),
      matching({ text: 'Listen to short talk 4. Which picture matches it?', audio: a.part3, ...matchOptions('d') }),
      matching({ text: 'Listen to short talk 5. Which picture matches it?', audio: a.part3, ...matchOptions('e') }),

      mc({ text: 'Who is Serik?', audio: a.part4, options: [{ id: 'a', label: 'Student' }, { id: 'b', label: 'Teacher' }, { id: 'c', label: 'Worker' }], correct: 'b' }),
      mc({ text: "Where is Dana's book?", audio: a.part4, options: [{ id: 'a', label: 'In the library' }, { id: 'b', label: 'At school' }, { id: 'c', label: 'At home' }], correct: 'c' }),
      mc({ text: 'What job does Aidar do?', audio: a.part4, options: [{ id: 'a', label: 'Driver' }, { id: 'b', label: 'Postman' }, { id: 'c', label: 'Builder' }], correct: 'a' }),
      mc({ text: 'What does Aizhan need?', audio: a.part4, options: [{ id: 'a', label: 'Sun cream' }, { id: 'b', label: 'Bag' }, { id: 'c', label: 'Sunglasses' }], correct: 'c' }),
      mc({ text: 'Why is Aruzhan tired?', audio: a.part4, options: [{ id: 'a', label: 'Helped her mum' }, { id: 'b', label: 'Studied all night' }, { id: 'c', label: 'Watched TV' }], correct: 'b' }),
    ],

    reading: [
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'The grandmother is in the kitchen and cooking baursak with her granddaughter.', image: img(11), correct: true }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'The girl is sitting in the yurt and holding a dombyra.', image: img(12), correct: false }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'The boy is outside and riding a horse near the mountains.', image: img(13), correct: true }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'The students are in the classroom and listening to their teacher.', image: img(14), correct: true }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'A girl is wearing a traditional Kazakh dress and taking a photo near the mountains.', image: img(15), correct: true }),

      ...(() => {
        const passage =
          "Last Sunday, our class went to the mountains near Almaty. We left school at 8 o'clock and went there by bus. The weather was cold but sunny. Our teacher told us about the mountains, and we listened carefully. After that, we took photos and had lunch together. Some students played in the snow, but I do not like cold weather. I was very happy because I was with my friends. We returned to school at 4 o'clock. It was a very interesting day."
        return [
          mc({ text: `${passage}\n\nWhere did they go?`, options: [{ id: 'a', label: 'Museum' }, { id: 'b', label: 'Mountain' }, { id: 'c', label: 'River' }], correct: 'b' }),
          mc({ text: `${passage}\n\nWhy was she so happy?`, options: [{ id: 'a', label: 'Because she was with her friends' }, { id: 'b', label: 'Because the weather was good' }, { id: 'c', label: 'Because they played in the snow' }], correct: 'a' }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'They had dinner together.', correct: false }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'They came back to school at night.', correct: false }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'The weather was cold.', correct: true }),
          shortAnswer({ text: `${passage}\n\nWhat did the teacher tell about?` }),
          shortAnswer({ text: `${passage}\n\nHow was the day?` }),
        ]
      })(),

      ...(() => {
        const letter =
          'Hi Dana,\nI cannot come to the party because I have an exam tomorrow. I need to stay at home and study. I need to learn by heart all new words from English. Please, do not get angry, next time I definitely will go.\nThank you very much.\nBest wishes, Aigerim'
        return [
          shortAnswer({ text: `${letter}\n\nWhy can't Aigerim go to the party?` }),
          shortAnswer({ text: `${letter}\n\nWhy does Aigerim want to stay at home?` }),
          shortAnswer({ text: `${letter}\n\nWhen does Aigerim have an exam?` }),
          shortAnswer({ text: `${letter}\n\nWhich subject is the exam for?` }),
        ]
      })(),

      ...(() => {
        const timetable = 'School Sports Club – Almaty\nMonday: Football – 14:00\nWednesday: Basketball – 4:30\nFriday: Volleyball – 3:30\nPlace: School gym'
        return [
          shortAnswer({ text: `${timetable}\n\nWhen is the football club?` }),
          shortAnswer({ text: `${timetable}\n\nWhat sport is on Wednesday?` }),
          shortAnswer({ text: `${timetable}\n\nWhat time is the volleyball club?` }),
          shortAnswer({ text: `${timetable}\n\nWhere do the students play sports?` }),
        ]
      })(),
    ],

    writing: [
      openText({
        text: 'Write about your school day. Answer the questions: What time do you go to school? What subjects do you study? Who is your favourite teacher?',
        placeholder: 'My school day...',
      }),
      openText({
        text: 'Look at the picture and write about it (5–6 sentences). Use the words: There is / There are, I can see …, in, on, under, near …',
        image: img(16),
        placeholder: 'I can see...',
      }),
    ],

    speaking: [
      audioResponse({
        text: 'Personal information. Answer: What do you usually do after school? How do you usually get to school? What is your favourite day of the week? Why? What do you usually do with your family at the weekend? What food do you like and why?',
      }),
      audioResponse({
        text: 'Look at the picture and talk about it.',
        image: img(17),
      }),
    ],
  },
}
