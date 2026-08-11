import { mc, tf, matching, shortAnswer, openText, audioResponse } from '../lib/import-helpers.mjs'

const IMG = '/tmp/variant3_extract/word/media'
const AUDIO = '/Users/nursultan/Desktop/work/example/test/variant 3'
const img = (n) => `${IMG}/image${n}.png`
const a = {
  part1: `${AUDIO}/Listening part 1.mp3`,
  part2: `${AUDIO}/listening part 2.mp3`,
  part3: `${AUDIO}/Listening part 3.mp3`,
  part4: `${AUDIO}/listening part 4.mp3`,
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
  name: 'A2 — Нұсқа 3',
  level: 'A2',
  sections: {
    listening: [
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(1), audio: a.part1, correct: false }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(2), audio: a.part1, correct: false }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(3), audio: a.part1, correct: true }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(4), audio: a.part1, correct: true }),
      tf({ text: 'Listen and look at the picture. Does it match what you hear?', image: img(5), audio: a.part1, correct: false }),

      mc({ text: 'Listen to the dialogue. Choose the correct answer.', audio: a.part2, options: [{ id: 'a', label: 'Mother' }, { id: 'b', label: 'Sister' }, { id: 'c', label: 'Father' }], correct: 'a' }),
      mc({ text: 'Listen to the dialogue. Choose the correct answer.', audio: a.part2, options: [{ id: 'a', label: 'Writing a letter' }, { id: 'b', label: 'Reading a book' }, { id: 'c', label: 'Reading a letter' }], correct: 'b' }),
      mc({ text: 'Listen to the dialogue. Choose the correct answer.', audio: a.part2, options: [{ id: 'a', label: 'Behind the cinema' }, { id: 'b', label: 'Behind the supermarket' }, { id: 'c', label: 'Behind the stadium' }], correct: 'c' }),
      mc({ text: 'Listen to the dialogue. Choose the correct answer.', audio: a.part2, options: [{ id: 'a', label: 'Two sisters' }, { id: 'b', label: "Doesn't have any" }, { id: 'c', label: 'One sister' }], correct: 'b' }),
      mc({ text: 'Listen to the dialogue. Choose the correct answer.', audio: a.part2, options: [{ id: 'a', label: 'Horses' }, { id: 'b', label: 'Cows' }, { id: 'c', label: 'Sheep' }], correct: 'b' }),

      matching({ text: 'Listen to short talk 1. Which picture matches it?', audio: a.part3, ...matchOptions('c') }),
      matching({ text: 'Listen to short talk 2. Which picture matches it?', audio: a.part3, ...matchOptions('b') }),
      matching({ text: 'Listen to short talk 3. Which picture matches it?', audio: a.part3, ...matchOptions('e') }),
      matching({ text: 'Listen to short talk 4. Which picture matches it?', audio: a.part3, ...matchOptions('d') }),
      matching({ text: 'Listen to short talk 5. Which picture matches it?', audio: a.part3, ...matchOptions('a') }),

      mc({ text: 'What does she need?', audio: a.part4, options: [{ id: 'a', label: 'A laptop' }, { id: 'b', label: 'A book' }, { id: 'c', label: 'A pen' }], correct: 'c' }),
      mc({ text: 'What does he need?', audio: a.part4, options: [{ id: 'a', label: 'A schoolbag' }, { id: 'b', label: 'A uniform' }, { id: 'c', label: 'Trainers' }], correct: 'a' }),
      mc({ text: 'What does she need?', audio: a.part4, options: [{ id: 'a', label: 'A hat' }, { id: 'b', label: 'Gloves' }, { id: 'c', label: 'Dress' }], correct: 'b' }),
      mc({ text: 'What does he need?', audio: a.part4, options: [{ id: 'a', label: 'Charger' }, { id: 'b', label: 'Headphones' }, { id: 'c', label: 'Flashcards' }], correct: 'a' }),
      mc({ text: 'What does she need to do?', audio: a.part4, options: [{ id: 'a', label: 'Wash her clothes' }, { id: 'b', label: 'Wash her hands' }, { id: 'c', label: 'Wash her face' }], correct: 'b' }),
    ],

    reading: [
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'The girl is in the greengrocers. She is buying vegetables.', image: img(12), correct: true }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'The boy is in the bathroom. He is brushing his teeth.', image: img(14), correct: false }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'The boy is skiing. He has a helmet and glasses.', image: img(15), correct: true }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'The boy is making a sandcastle but his mother is sunbathing.', image: img(16), correct: true }),
      tf({ text: 'Look at the picture. Is the sentence correct?', statement: 'The girl is in the garden. She is watering flowers.', image: img(17), correct: false }),

      ...(() => {
        const passage =
          "At weekends I went to the park with my family. The weather was warm and sunny. I had my bag with me. In the park we played, walked and sat on a bench. After that we bought an ice-cream, we were so happy. Then I couldn't find my bag, I was so sad and cried. We went back to the bench and started to look for it. Luckily, I found my bag under the bench."
        return [
          mc({ text: `${passage}\n\nWhere did they go?`, options: [{ id: 'a', label: 'Park' }, { id: 'b', label: 'Museum' }, { id: 'c', label: 'City' }], correct: 'a' }),
          mc({ text: `${passage}\n\nWhy was she so sad?`, options: [{ id: 'a', label: 'Lost her money' }, { id: 'b', label: 'Lost her bag' }, { id: 'c', label: 'Lost her keys' }], correct: 'b' }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'The girl started to look for her keys.', correct: false }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'When she found her bag she was happy.', correct: true }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'She found her bag behind the bench.', correct: true }),
          shortAnswer({ text: `${passage}\n\nWhat did they do in the park?` }),
          shortAnswer({ text: `${passage}\n\nWhen did they go to the park?` }),
        ]
      })(),

      ...(() => {
        const letter =
          'Hello Aizhan!\nI want to invite you to my birthday party. It is on Sunday at 7 pm. We will have music, cake and drinks. All our friends will be there. The party is at my house. My house is behind the school, 51 Syrym Batyr Street. Please come and have fun with us!\nYour friend, Aigerim'
        return [
          shortAnswer({ text: `${letter}\n\nWhere did Aigerim invite her friend?` }),
          shortAnswer({ text: `${letter}\n\nWho will be at the party?` }),
          shortAnswer({ text: `${letter}\n\nWhere is the party?` }),
          shortAnswer({ text: `${letter}\n\nWhere is Aigerim's house?` }),
        ]
      })(),

      ...(() => {
        const notice =
          'Voluntary work\nJoin our School Voluntary Club in Almaty! We help to keep the city clean and green!\nSaturday: pick up rubbish at 11:00.\nSunday: planting trees and flowers – 10:00\nMeeting place: School yard'
        return [
          shortAnswer({ text: `${notice}\n\nWhat is the name of the club?` }),
          shortAnswer({ text: `${notice}\n\nWhat do students do on Saturday?` }),
          shortAnswer({ text: `${notice}\n\nWhat do students do on Sunday?` }),
          shortAnswer({ text: `${notice}\n\nWhere do they meet?` }),
        ]
      })(),
    ],

    writing: [
      openText({
        text: 'Write about a bookstore that you visited before. Answer the questions: Why did you go to the bookstore? What did you buy in the bookstore? Did you like it?',
        placeholder: 'I went to the bookstore...',
      }),
      openText({
        text: 'Look at the picture and write about it (5–6 sentences). Use the words: There is / There are, I can see …, Some parents ...',
        image: img(18),
        placeholder: 'I can see...',
      }),
    ],

    speaking: [
      audioResponse({
        text: 'Personal information. Answer: What is your name? Where do you live? What is your favourite hobby? Why? What is your favourite place? Why? Do you like summer or winter? Why?',
        points: 5,
      }),
      audioResponse({
        text: 'Look at the picture. Speak for 2 minutes about it. Use: Who can you see? What are they doing? Where are they? What can you see in the picture?',
        image: img(19),
        points: 15,
      }),
    ],
  },
}
