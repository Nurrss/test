import { mc, tf, matching, shortAnswer, openText, audioResponse } from '../lib/import-helpers.mjs'

const IMG = '/tmp/variant4_extract/word/media'
const AUDIO = '/Users/nursultan/Desktop/work/example/test/Variant 4'
const img = (n) => `${IMG}/image${n}.png`
const a = {
  part1: `${AUDIO}/Listening part 1.mp3`,
  part2: `${AUDIO}/listening part 2.mp3`,
  part3: `${AUDIO}/Listening part 3.mp3`,
  part4: `${AUDIO}/part 4.mp3`,
}

// Content-matched to the Part 3 transcript (lunchbox / birthday cake / sleepy
// classroom / found phone / rain), then labelled so the given answer key
// (11.C 12.E 13.D 14.A 15.B) lines up.
const matchOptions = (correct) => ({
  options: [
    { id: 'a', label: 'A', image: img(6) }, { id: 'b', label: 'B', image: img(7) }, { id: 'c', label: 'C', image: img(8) },
    { id: 'd', label: 'D', image: img(9) }, { id: 'e', label: 'E', image: img(10) },
  ],
  correct,
})

export default {
  id: crypto.randomUUID(),
  name: 'A2 — Нұсқа 4',
  level: 'A2',
  sections: {
    listening: [
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(1), audio: a.part1, correct: true }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(2), audio: a.part1, correct: false }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(3), audio: a.part1, correct: true }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(4), audio: a.part1, correct: true }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(5), audio: a.part1, correct: false }),

      mc({ text: "Where is her bag?", audio: a.part2, options: [{ id: 'a', label: 'On the table' }, { id: 'b', label: 'On the chair' }, { id: 'c', label: 'On the shelf' }], correct: 'a' }),
      mc({ text: 'How many books does he have?', audio: a.part2, options: [{ id: 'a', label: '7' }, { id: 'b', label: '5' }, { id: 'c', label: '3' }], correct: 'c' }),
      mc({ text: 'What time does she go to school?', audio: a.part2, options: [{ id: 'a', label: '6 o’clock' }, { id: 'b', label: '8 o’clock' }, { id: 'c', label: '5 o’clock' }], correct: 'b' }),
      mc({ text: 'Where is the pupil?', audio: a.part2, options: [{ id: 'a', label: 'In the classroom' }, { id: 'b', label: 'In the library' }, { id: 'c', label: 'In the schoolbag' }], correct: 'b' }),
      mc({ text: 'Who can ride a horse?', audio: a.part2, options: [{ id: 'a', label: 'The girl' }, { id: 'b', label: 'The boy' }, { id: 'c', label: 'Both' }], correct: 'a' }),

      matching({ text: 'Listen to short talk 1. Which picture matches it?', audio: a.part3, ...matchOptions('c') }),
      matching({ text: 'Listen to short talk 2. Which picture matches it?', audio: a.part3, ...matchOptions('e') }),
      matching({ text: 'Listen to short talk 3. Which picture matches it?', audio: a.part3, ...matchOptions('d') }),
      matching({ text: 'Listen to short talk 4. Which picture matches it?', audio: a.part3, ...matchOptions('a') }),
      matching({ text: 'Listen to short talk 5. Which picture matches it?', audio: a.part3, ...matchOptions('b') }),

      mc({ text: 'What should he do?', audio: a.part4, options: [{ id: 'a', label: 'Eat' }, { id: 'b', label: 'Play' }, { id: 'c', label: 'Sleep' }], correct: 'c' }),
      mc({ text: 'What day is tomorrow?', audio: a.part4, options: [{ id: 'a', label: 'Tuesday' }, { id: 'b', label: 'Friday' }, { id: 'c', label: 'Sunday' }], correct: 'b' }),
      mc({ text: 'Which season is it?', audio: a.part4, options: [{ id: 'a', label: 'Winter' }, { id: 'b', label: 'Summer' }, { id: 'c', label: 'Autumn' }], correct: 'a' }),
      mc({ text: 'What do you eat?', audio: a.part4, options: [{ id: 'a', label: 'Apple' }, { id: 'b', label: 'Banana' }, { id: 'c', label: 'Carrot' }], correct: 'a' }),
      mc({ text: 'What should you ask?', audio: a.part4, options: [{ id: 'a', label: 'Meal' }, { id: 'b', label: 'Drink' }, { id: 'c', label: 'Breakfast' }], correct: 'b' }),
    ],

    reading: [
      // item1 is deliberately mismatched (Kanat "cycling" claim, photo shows a different sport) — correct = Wrong
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'Kanat likes sport. He is cycling now.', image: img(11), correct: false }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'Aruzhan is sitting and playing dombyra.', image: img(13), correct: true }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'Aldar Kose is riding a horse in the middle of the steppe.', image: img(14), correct: true }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'Daryn is at the hairdresser. He is cutting his hair.', image: img(15), correct: false }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: "Arman's father is a mechanic. He is repairing his car.", image: img(16), correct: false }),

      ...(() => {
        const passage =
          'At weekends Arman went to the city with his father. He saw rubbish in the street. Arman talks with his father. His father says "Nature is important". He tells Arman to plant trees. Trees help people and animals. Arman plants trees and flowers.'
        return [
          mc({ text: `${passage}\n\nWho is Arman with?`, options: [{ id: 'a', label: 'Friend' }, { id: 'b', label: 'Uncle' }, { id: 'c', label: 'Father' }], correct: 'c' }),
          mc({ text: `${passage}\n\nWhat does his father say?`, options: [{ id: 'a', label: 'Plant trees' }, { id: 'b', label: 'Clean the room' }, { id: 'c', label: 'Throw rubbish' }], correct: 'a' }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'Trees are important because they help people.', correct: true }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'Arman went to the city on Tuesday.', correct: false }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: '"Nature isn\'t important," says Arman\'s father.', correct: false }),
          shortAnswer({ text: `${passage}\n\nWhat did Arman see in the street?` }),
          shortAnswer({ text: `${passage}\n\nWhat did Arman plant?` }),
        ]
      })(),

      ...(() => {
        const letter =
          'Hello Zhandos!\nHow are you? How is your holiday? I want to invite you to join book club. It is every Saturday at 10 o\'clock. Book club is at school library. We read books and enjoy! The club is fun and interesting. Please come and join us!\nYour friend, Askhat'
        return [
          shortAnswer({ text: `${letter}\n\nWhat does Askhat invite Zhandos to?` }),
          shortAnswer({ text: `${letter}\n\nWhen is the book club?` }),
          shortAnswer({ text: `${letter}\n\nWhat time does book club start?` }),
          shortAnswer({ text: `${letter}\n\nWhere is book club?` }),
        ]
      })(),

      ...(() => {
        const notice =
          'Football club\nJoin our Football club!\nPlace: School playground\nTime: 4 pm.\nDay: every Saturday and Sunday\nWe play! We have fun! We run and enjoy!\nAll students are welcome!'
        return [
          shortAnswer({ text: `${notice}\n\nWhat time does football club start?` }),
          shortAnswer({ text: `${notice}\n\nWhen is football club meeting?` }),
          shortAnswer({ text: `${notice}\n\nWhere do students play football?` }),
          shortAnswer({ text: `${notice}\n\nWhat do they do?` }),
        ]
      })(),
    ],

    writing: [
      openText({
        text: 'Write about a book that you read before. Answer the questions: What is the name of the book? What is the book about? Did you like the book? Why?',
        placeholder: 'I read a book called...',
      }),
      openText({
        text: 'Describe the picture (1–2 minutes). Use the words: There is / There are, I can see ……, The girl is …….',
        image: img(17),
        placeholder: 'I can see...',
      }),
    ],

    speaking: [
      audioResponse({
        text: 'Personal information. Answer: What is your name? How old are you? What is your favourite music? Why? What is your favourite food? Why? Do you like vegetables or fruit? Why?',
        points: 5,
      }),
      audioResponse({
        text: 'Look at the picture and talk about it. Use: Who can you see? What are they doing? Where are they?',
        image: img(18),
        points: 15,
      }),
    ],
  },
}
