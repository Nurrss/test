import { mc, tf, matching, shortAnswer, openText, audioResponse } from '../lib/import-helpers.mjs'

const IMG = '/private/tmp/claude-502/-Users-nursultan-Desktop-work-example/919bff82-57bb-4ff4-b32e-69def87fd042/scratchpad/a2v2/word/media'
const AUDIO = '/Users/nursultan/Desktop/work/example/test/A2 variant 2'
const JPEG_IMAGES = new Set([14])
const img = (n) => `${IMG}/image${n}.${JPEG_IMAGES.has(n) ? 'jpeg' : 'png'}`
const a = {
  part1: `${AUDIO}/part 1.mp3`,
  part2: `${AUDIO}/part 2.mp3`,
  part3: `${AUDIO}/part 3.mp3`,
  part4: `${AUDIO}/part 4.mp3`,
}

export default {
  id: crypto.randomUUID(),
  name: 'A2 — Нұсқа 2',
  level: 'A2',
  sections: {
    listening: [
      // Part 1 — picture-based multiple choice (Questions 1-5), one dialogue per question, 3 photo options
      mc({
        text: "Friend: What are you doing this weekend? Girl: My family is going to Medeu. Then we want to walk in the mountains and have a picnic if the weather is good.\n\nWhere is the girl going?",
        audio: a.part1,
        options: [
          { id: 'a', label: 'A', image: img(1) },
          { id: 'b', label: 'B', image: img(2) },
          { id: 'c', label: 'C', image: img(3) },
        ],
        correct: 'a',
      }),
      mc({
        text: "Customer: Excuse me. How much is the fruit? Shop assistant: Apples are 450 tenge per kilo and oranges are 700 tenge today. Customer: That's a good price. I'll take two kilos of apples.\n\nWhat is the customer buying?",
        audio: a.part1,
        options: [
          { id: 'a', label: 'A', image: img(4) },
          { id: 'b', label: 'B', image: img(5) },
          { id: 'c', label: 'C', image: img(6) },
        ],
        correct: 'c',
      }),
      mc({
        text: "Tourist 1: How did you get to Kok Tobe? Tourist 2: There are different ways to get there, such as by taxi, car or cable car. We chose the cable car because it was faster and the view was beautiful.\n\nHow will they go to Kok Tobe?",
        audio: a.part1,
        options: [
          { id: 'a', label: 'A', image: img(7) },
          { id: 'b', label: 'B', image: img(8) },
          { id: 'c', label: 'C', image: img(9) },
        ],
        correct: 'b',
      }),
      mc({
        text: "Librarian: Can I help you? Student: Yes, I'm looking for an English storybook. Librarian: They're on the second shelf near the window. Student: Thank you very much.\n\nWhere is the student?",
        audio: a.part1,
        options: [
          { id: 'a', label: 'A', image: img(10) },
          { id: 'b', label: 'B', image: img(11) },
          { id: 'c', label: 'C', image: img(12) },
        ],
        correct: 'a',
      }),
      mc({
        text: "PE Teacher: Today our lesson is in the gym. Student: Are we playing basketball again? PE Teacher: No. Today we're learning volleyball. Student: Great! I like volleyball.\n\nWhat sport will the students learn today?",
        audio: a.part1,
        options: [
          { id: 'a', label: 'A', image: img(13) },
          { id: 'b', label: 'B', image: img(14) },
          { id: 'c', label: 'C', image: img(15) },
        ],
        correct: 'b',
      }),

      // Part 2 — match each short dialogue to a picture (Questions 6-10), one audio for all 5
      matching({
        text: 'Listen to dialogue 1. Which picture matches it?', audio: a.part2,
        options: [
          { id: 'a', label: 'A', image: img(16) }, { id: 'b', label: 'B', image: img(17) }, { id: 'c', label: 'C', image: img(18) },
          { id: 'd', label: 'D', image: img(19) }, { id: 'e', label: 'E', image: img(20) }, { id: 'f', label: 'F', image: img(21) },
        ], correct: 'b',
      }),
      matching({
        text: 'Listen to dialogue 2. Which picture matches it?', audio: a.part2,
        options: [
          { id: 'a', label: 'A', image: img(16) }, { id: 'b', label: 'B', image: img(17) }, { id: 'c', label: 'C', image: img(18) },
          { id: 'd', label: 'D', image: img(19) }, { id: 'e', label: 'E', image: img(20) }, { id: 'f', label: 'F', image: img(21) },
        ], correct: 'd',
      }),
      matching({
        text: 'Listen to dialogue 3. Which picture matches it?', audio: a.part2,
        options: [
          { id: 'a', label: 'A', image: img(16) }, { id: 'b', label: 'B', image: img(17) }, { id: 'c', label: 'C', image: img(18) },
          { id: 'd', label: 'D', image: img(19) }, { id: 'e', label: 'E', image: img(20) }, { id: 'f', label: 'F', image: img(21) },
        ], correct: 'c',
      }),
      matching({
        text: 'Listen to dialogue 4. Which picture matches it?', audio: a.part2,
        options: [
          { id: 'a', label: 'A', image: img(16) }, { id: 'b', label: 'B', image: img(17) }, { id: 'c', label: 'C', image: img(18) },
          { id: 'd', label: 'D', image: img(19) }, { id: 'e', label: 'E', image: img(20) }, { id: 'f', label: 'F', image: img(21) },
        ], correct: 'a',
      }),
      matching({
        text: 'Listen to dialogue 5. Which picture matches it?', audio: a.part2,
        options: [
          { id: 'a', label: 'A', image: img(16) }, { id: 'b', label: 'B', image: img(17) }, { id: 'c', label: 'C', image: img(18) },
          { id: 'd', label: 'D', image: img(19) }, { id: 'e', label: 'E', image: img(20) }, { id: 'f', label: 'F', image: img(21) },
        ], correct: 'e',
      }),

      // Part 3 — intention & main idea (Questions 11-15)
      mc({ text: 'Why are they going to the pharmacy?', audio: a.part3, options: [{ id: 'a', label: 'To buy medicine.' }, { id: 'b', label: 'To buy food.' }, { id: 'c', label: 'To visit a friend.' }, { id: 'd', label: 'To catch a bus.' }], correct: 'a' }),
      mc({ text: 'Why are the people waiting?', audio: a.part3, options: [{ id: 'a', label: 'To see a doctor' }, { id: 'b', label: 'To catch a train.' }, { id: 'c', label: 'To buy concert tickets.' }, { id: 'd', label: 'To buy groceries.' }], correct: 'c' }),
      mc({ text: 'Why will they leave home early?', audio: a.part3, options: [{ id: 'a', label: 'They want to visit the city.' }, { id: 'b', label: 'They need to arrive at the airport in time.' }, { id: 'c', label: 'They want to take a taxi.' }, { id: 'd', label: 'They missed the plane.' }], correct: 'b' }),
      mc({ text: 'Why is the man talking to the receptionist?', audio: a.part3, options: [{ id: 'a', label: 'He wants to make a reservation.' }, { id: 'b', label: 'He wants to buy a train ticket.' }, { id: 'c', label: 'He wants to order food.' }, { id: 'd', label: 'He wants to visit a museum.' }], correct: 'a' }),
      mc({ text: 'What happened with the girl?', audio: a.part3, options: [{ id: 'a', label: 'She lost her keys' }, { id: 'b', label: 'She lost her pencilcase' }, { id: 'c', label: 'She lost her money' }, { id: 'd', label: 'She lost her backpack' }], correct: 'd' }),

      // Part 4 — listen to the hotel announcement and fill in specific details (Questions 16-20)
      ...(() => {
        const intro = 'Listen to the announcement about Alatau Hotel.\n\n'
        return [
          shortAnswer({ text: `${intro}Comfortable rooms with ___?___`, audio: a.part4 }),
          shortAnswer({ text: `${intro}Breakfast starts at ___?___`, audio: a.part4 }),
          shortAnswer({ text: `${intro}The hotel is open ___?___`, audio: a.part4 }),
          shortAnswer({ text: `${intro}All rooms have a ___?___`, audio: a.part4 }),
          shortAnswer({ text: `${intro}Check out time is ___?___`, audio: a.part4 }),
        ]
      })(),
    ],

    reading: [
      // Part 1 — read the "Lost Dog" announcement poster (Questions 1-5)
      mc({ text: 'What is this announcement about?', image: img(22), options: [{ id: 'a', label: 'A lost cat.' }, { id: 'b', label: 'A lost dog.' }, { id: 'c', label: 'An ill dog' }], correct: 'b' }),
      mc({ text: "What colour is the dog's fur?", image: img(22), options: [{ id: 'a', label: 'Black and white.' }, { id: 'b', label: 'Brown and white.' }, { id: 'c', label: 'Orange and white.' }], correct: 'c' }),
      mc({ text: 'What does the dog have?', image: img(22), options: [{ id: 'a', label: 'Small ears.' }, { id: 'b', label: 'Big ears.' }, { id: 'c', label: 'A short tail.' }], correct: 'b' }),
      mc({ text: 'Where does the dog like to lie?', image: img(22), options: [{ id: 'a', label: 'On the playground.' }, { id: 'b', label: 'On the grass.' }, { id: 'c', label: 'On the bed.' }], correct: 'b' }),
      mc({ text: 'What should you do if you see the dog?', image: img(22), options: [{ id: 'a', label: 'Take it to school.' }, { id: 'b', label: 'Keep it.' }, { id: 'c', label: 'Contact Aidar.' }], correct: 'c' }),

      // Part 2 — text comprehension, Ernar's first day at school (Questions 6-12)
      ...(() => {
        const passage =
          "It was Ernar's first day at new school. He was so excited, because he wanted to see his new teacher and classmates. However, every school has its own rules. Luckily, Nursultan came to Ernar and showed him the classrooms, the library and the school canteen. He also explained that he can use his phone only after the school. During the lesson or breaktime using mobile phones are forbidden. So, Ernar put his phone his bag. Later, he saw some students running in the corridor. A teacher asked them to stop because running inside the school could be dangerous.\n\nAt the end of the day, Ernar thanked Nursultan for his help. They quickly became friends. The next morning, Ernar arrived ten minutes early and was ready for his lessons. He liked his new friends and school."
        return [
          mc({ text: `${passage}\n\nWhy did Ernar need Nursultan's help?`, options: [{ id: 'a', label: 'He could not find his phone.' }, { id: 'b', label: 'He did not know the school rules.' }, { id: 'c', label: 'He wanted to change his class.' }, { id: 'd', label: 'He forgot his school uniform.' }], correct: 'b' }),
          mc({ text: `${passage}\n\nWhat must students wear every day?`, options: [{ id: 'a', label: 'Sports clothes' }, { id: 'b', label: 'A school uniform' }, { id: 'c', label: 'A school jacket' }, { id: 'd', label: 'Special shoes' }], correct: 'b' }),
          mc({ text: `${passage}\n\nWhat did other students do in the corridor?`, options: [{ id: 'a', label: 'Using phones' }, { id: 'b', label: 'Eating' }, { id: 'c', label: 'Running' }, { id: 'd', label: 'Crying' }], correct: 'c' }),
          tf({ text: `${passage}\n\nIs the sentence correct?`, statement: 'A teacher stopped some students from running in the corridor.', correct: true }),
          mc({ text: `${passage}\n\nWhy did the teacher stop the students in the corridor?`, options: [{ id: 'a', label: 'They were late for class.' }, { id: 'b', label: 'They were making too much noise.' }, { id: 'c', label: 'Running there could be dangerous.' }, { id: 'd', label: 'They were using their phones.' }], correct: 'c' }),
          mc({ text: `${passage}\n\nWhat happened the next morning?`, options: [{ id: 'a', label: 'Ernar arrived a bit early' }, { id: 'b', label: 'Ernar was late' }, { id: 'c', label: "Ernar didn't like school" }, { id: 'd', label: 'Ernar missed the lesson' }], correct: 'a' }),
          mc({
            text: `${passage}\n\nPut the events in the correct order:\n1. Ernar put his phone in his bag.\n2. Nursultan showed Ernar around the school.\n3. Ernar arrived ten minutes early the next morning.\n4. A teacher stopped some students from running.`,
            options: [{ id: 'a', label: '2 → 1 → 4 → 3' }, { id: 'b', label: '1 → 2 → 3 → 4' }, { id: 'c', label: '2 → 4 → 1 → 3' }, { id: 'd', label: '4 → 2 → 1 → 3' }],
            correct: 'a',
          }),
        ]
      })(),

      // Part 3 — the dombyra article (Questions 13-20)
      ...(() => {
        const article =
          "The dombyra is unique Kazak traditional musical instrument. It has two strings and is typically made of wood. It has a long history and has been part of Kazakh culture for hundreds of years. Dombyra's music is called küy — a short instrumental composition that often tells a story without words.\n\nIn the past, Kazakh people often played the dombyra at family celebrations and important events. Musicians also travelled from one village to another and played küy, a traditional type of music. Through music, they could tell stories about people, nature and important events. For foreign listeners, dombyra's music can be surprising. It has two strings and its great voice makes it special and loved by many people.\n\nToday, dombyra is heard not only in villages and traditional gatherings, but also in concert halls, schools, universities, television broadcasts and international performances. Now, dombyra plays an important role in education. Children in Kazakhstan learn to play dombyra as part of their cultural heritage. Young people continue to learn and play the dombra. This helps keep Kazakh traditions alive for future generations."
        return [
          mc({ text: `${article}\n\nWhat is the main idea of the article?`, options: [{ id: 'a', label: 'Famous musicians in Kazakhstan' }, { id: 'b', label: 'The history and importance of the dombra' }, { id: 'c', label: 'Different musical instruments' }, { id: 'd', label: 'Family celebrations in Kazakhstan' }], correct: 'b' }),
          mc({ text: `${article}\n\nHow many strings does the dombra have?`, options: [{ id: 'a', label: 'One' }, { id: 'b', label: 'Two' }, { id: 'c', label: 'Three' }, { id: 'd', label: 'Four' }], correct: 'b' }),
          mc({ text: `${article}\n\nWhat does the word "heritage" mean in the article?`, options: [{ id: 'a', label: 'Traditions and culture from the past' }, { id: 'b', label: 'A type of musical instrument' }, { id: 'c', label: 'A modern music school' }, { id: 'd', label: 'A family celebration' }], correct: 'a' }),
          tf({ text: `${article}\n\nIs the sentence correct?`, statement: 'In the past, musicians travelled from one village to another and played küy.', correct: true }),
          tf({ text: `${article}\n\nIs the sentence correct?`, statement: 'Today, the dombra is played only in villages.', correct: false }),
          matching({
            text: `${article}\n\nMatch the idea with the information. Which does "Küy" refer to?`,
            options: [
              { id: 'a', label: 'A. Learn to play the dombra' },
              { id: 'b', label: 'B. Tells a story without words' },
              { id: 'c', label: 'C. Travelled from village to village' },
            ],
            correct: 'b',
          }),
          matching({
            text: `${article}\n\nMatch the idea with the information. Which does "Musicians in the past" refer to?`,
            options: [
              { id: 'a', label: 'A. Learn to play the dombra' },
              { id: 'b', label: 'B. Tells a story without words' },
              { id: 'c', label: 'C. Travelled from village to village' },
            ],
            correct: 'c',
          }),
          matching({
            text: `${article}\n\nMatch the idea with the information. Which does "Children today" refer to?`,
            options: [
              { id: 'a', label: 'A. Learn to play the dombra' },
              { id: 'b', label: 'B. Tells a story without words' },
              { id: 'c', label: 'C. Travelled from village to village' },
            ],
            correct: 'a',
          }),
        ]
      })(),
    ],

    writing: [
      openText({
        text: 'You are spending your weekend in another city. Write a postcard to your English-speaking friend. In your postcard: say where you are; describe one place you visited; say what you liked about your trip. Write 40–50 words.',
        placeholder: 'Dear friend...',
      }),
      openText({
        text: 'Look at the picture and write 40–50 words. Include: where the people are, what they are doing, what happened, how they might feel.',
        image: img(24),
        placeholder: 'In the picture...',
      }),
    ],

    speaking: [
      audioResponse({
        text: 'Personal questions. Answer: Tell about your typical school day. What do you enjoy doing in your free time? What is your favourite season? Why? Where do you usually go with your friends? Tell about something interesting you did last week.',
      }),
      audioResponse({
        text: 'Describe the picture. Look at the picture and talk about it.',
        image: img(25),
      }),
      audioResponse({
        text: 'Situation-based task. You are going home by bus. Suddenly, you realize that you are on the wrong bus. What should you do? Who can you ask for help? How can you find the correct bus?',
      }),
    ],
  },
}
