import { mc, tf, matching, shortAnswer, openText, audioResponse } from '../lib/import-helpers.mjs'

const IMG = '/private/tmp/claude-502/-Users-nursultan-Desktop-work-example/919bff82-57bb-4ff4-b32e-69def87fd042/scratchpad/a2v1/word/media'
const AUDIO = '/Users/nursultan/Desktop/work/example/test/A2 variant 1'
const JPEG_IMAGES = new Set([25])
const img = (n) => `${IMG}/image${n}.${JPEG_IMAGES.has(n) ? 'jpeg' : 'png'}`
const a = {
  part1: `${AUDIO}/part 1.mp3`,
  part2: `${AUDIO}/part 2.mp3`,
  part3: `${AUDIO}/part 3.mp3`,
  part4: `${AUDIO}/part 4.mp3`,
}

export default {
  id: crypto.randomUUID(),
  name: 'A2 — Нұсқа 1',
  level: 'A2',
  sections: {
    listening: [
      // Part 1 — according to photo, find correct answer (Q1-5, 3 picture options each)
      mc({
        text: 'Listen and choose the correct picture. What time does the English class start?', audio: a.part1,
        options: [{ id: 'a', label: 'A', image: img(1) }, { id: 'b', label: 'B', image: img(2) }, { id: 'c', label: 'C', image: img(3) }],
        correct: 'c',
      }),
      mc({
        text: 'Listen and choose the correct picture. Is the new director sitting at the laptop or holding a paper?', audio: a.part1,
        options: [{ id: 'a', label: 'A', image: img(4) }, { id: 'b', label: 'B', image: img(5) }, { id: 'c', label: 'C', image: img(6) }],
        correct: 'a',
      }),
      mc({
        text: 'Listen and choose the correct picture. What is the weather like in Astana today?', audio: a.part1,
        options: [{ id: 'a', label: 'A', image: img(7) }, { id: 'b', label: 'B', image: img(8) }, { id: 'c', label: 'C', image: img(9) }],
        correct: 'c',
      }),
      mc({
        text: 'Listen and choose the correct picture. What are Dana and Ernar doing?', audio: a.part1,
        options: [{ id: 'a', label: 'A', image: img(10) }, { id: 'b', label: 'B', image: img(11) }, { id: 'c', label: 'C', image: img(12) }],
        correct: 'c',
      }),
      mc({
        text: 'Listen and choose the correct picture. What are the children playing near the house?', audio: a.part1,
        options: [{ id: 'a', label: 'A', image: img(13) }, { id: 'b', label: 'B', image: img(14) }, { id: 'c', label: 'C', image: img(15) }],
        correct: 'b',
      }),

      // Part 2 — 5 short dialogues, one shared set of 6 lettered pictures (Q6-10)
      matching({
        text: 'Listen to dialogue 1. Which picture matches it?', audio: a.part2,
        options: [
          { id: 'a', label: 'A', image: img(16) }, { id: 'b', label: 'B', image: img(17) }, { id: 'c', label: 'C', image: img(18) },
          { id: 'd', label: 'D', image: img(19) }, { id: 'e', label: 'E', image: img(20) }, { id: 'f', label: 'F', image: img(21) },
        ], correct: 'f',
      }),
      matching({
        text: 'Listen to dialogue 2. Which picture matches it?', audio: a.part2,
        options: [
          { id: 'a', label: 'A', image: img(16) }, { id: 'b', label: 'B', image: img(17) }, { id: 'c', label: 'C', image: img(18) },
          { id: 'd', label: 'D', image: img(19) }, { id: 'e', label: 'E', image: img(20) }, { id: 'f', label: 'F', image: img(21) },
        ], correct: 'e',
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
        ], correct: 'b',
      }),
      matching({
        text: 'Listen to dialogue 5. Which picture matches it?', audio: a.part2,
        options: [
          { id: 'a', label: 'A', image: img(16) }, { id: 'b', label: 'B', image: img(17) }, { id: 'c', label: 'C', image: img(18) },
          { id: 'd', label: 'D', image: img(19) }, { id: 'e', label: 'E', image: img(20) }, { id: 'f', label: 'F', image: img(21) },
        ], correct: 'a',
      }),

      // Part 3 — intention & main idea (Q11-15)
      mc({
        text: 'Why does the boy suggest taking a taxi?', audio: a.part3,
        options: [
          { id: 'a', label: 'He wants to travel by taxi.' },
          { id: 'b', label: 'He wants to be on time to the lesson.' },
          { id: 'c', label: "He doesn't know the bus route." },
          { id: 'd', label: 'He wants to visit a mall.' },
        ], correct: 'b',
      }),
      mc({
        text: 'What is the teacher asking the students to do?', audio: a.part3,
        options: [
          { id: 'a', label: 'Clean the classroom' },
          { id: 'b', label: 'Buy some books' },
          { id: 'c', label: 'Prepare for Nauryz festival' },
          { id: 'd', label: 'Go home' },
        ], correct: 'c',
      }),
      mc({
        text: 'Why do they decide to travel by metro?', audio: a.part3,
        options: [
          { id: 'a', label: 'They want to save money.' },
          { id: 'b', label: "They don't like taking buses." },
          { id: 'c', label: 'They want to visit another station.' },
          { id: 'd', label: 'They want to arrive before the tour begins.' },
        ], correct: 'a',
      }),
      mc({
        text: 'Why does the guide give such advice?', audio: a.part3,
        options: [
          { id: 'a', label: 'People will visit a museum.' },
          { id: 'b', label: 'The trip includes a long walk in hot weather.' },
          { id: 'c', label: 'Travellers will take a train.' },
          { id: 'd', label: 'The weather will be cold.' },
        ], correct: 'b',
      }),
      mc({
        text: 'Why does she want to visit the museum?', audio: a.part3,
        options: [
          { id: 'a', label: 'She wants to buy a traditional instrument.' },
          { id: 'b', label: 'She wants to learn more about traditional music.' },
          { id: 'c', label: 'She is looking for her music teacher.' },
          { id: 'd', label: 'She needs to finish her homework.' },
        ], correct: 'b',
      }),

      // Part 4 — listen to the announcement and write specific details (Q16-20)
      shortAnswer({ text: 'Listen to the announcement. Where will the class meet?', audio: a.part4 }),
      shortAnswer({ text: 'Listen to the announcement. How much does a roundtrip cable car ticket cost?', audio: a.part4 }),
      shortAnswer({ text: 'Listen to the announcement. What can students take from the foot of the mountain?', audio: a.part4 }),
      shortAnswer({ text: 'Listen to the announcement. What should students wear?', audio: a.part4 }),
      shortAnswer({ text: 'Listen to the announcement. What time will they return to school?', audio: a.part4 }),
    ],

    reading: [
      // Part 1 — library rules poster (Q1-5)
      mc({
        text: 'Read the library rules.\n\nWhat should you do in the library?', image: img(22),
        options: [{ id: 'a', label: 'Talk loudly' }, { id: 'b', label: 'Speak quietly' }, { id: 'c', label: 'Listen to music' }, { id: 'd', label: 'Run' }],
        correct: 'b',
      }),
      mc({
        text: 'Read the library rules.\n\nWhat is NOT allowed in the library?', image: img(22),
        options: [{ id: 'a', label: 'Reading books' }, { id: 'b', label: 'Borrowing books' }, { id: 'c', label: 'Eating and drinking' }, { id: 'd', label: 'Studying' }],
        correct: 'c',
      }),
      mc({
        text: 'Read the library rules.\n\nWhat should you do with library books?', image: img(22),
        options: [{ id: 'a', label: 'Write in them' }, { id: 'b', label: 'Leave them on the floor' }, { id: 'c', label: 'Give them to a friend' }, { id: 'd', label: 'Treat them with care' }],
        correct: 'd',
      }),
      mc({
        text: 'Read the library rules.\n\nWhat should you do with your phone?', image: img(22),
        options: [{ id: 'a', label: 'Turn up the volume' }, { id: 'b', label: 'Make phone calls' }, { id: 'c', label: 'Keep it on silent' }, { id: 'd', label: 'Leave it at home' }],
        correct: 'c',
      }),
      mc({
        text: 'Read the library rules.\n\nWhat happens if you return a book late?', image: img(22),
        options: [{ id: 'a', label: 'You must pay a fine.' }, { id: 'b', label: 'You can keep it longer.' }, { id: 'c', label: 'You get a new book.' }, { id: 'd', label: 'Nothing happens.' }],
        correct: 'a',
      }),

      // Part 2 — Amina and Dana story (Q6-12)
      ...(() => {
        const passage =
          "Last weekend, Amina visited her old friend, Dana, who lives near Almaty. They had not seen each other for several months, so Dana was very happy to see her. When Amina arrived, Dana's grandmother was preparing lunch. She made traditional Kazakh food, including baursak, kazy and kurt, and served tea.\n\nAfter lunch, the family talked and looked at old family photos. Amina enjoyed seeing pictures of Dana when she was younger. Later, Dana's grandfather told them funny stories about his childhood. The children listened carefully and asked him many questions.\n\nIn the evening, it was time for Amina to go home. She thanked Dana's grandparents for their warm welcome. Before she left, Dana's grandmother gave her some homemade sweets to take home. Amina felt a little tired, but she was happy because she had spent a wonderful day with her friend."
        return [
          mc({
            text: `${passage}\n\nWhy was Dana happy to see Amina?`,
            options: [
              { id: 'a', label: 'Amina brought her a present.' },
              { id: 'b', label: 'They had not met for several months.' },
              { id: 'c', label: 'They were going to Almaty.' },
              { id: 'd', label: 'Amina helped her grandmother.' },
            ], correct: 'b',
          }),
          mc({
            text: `${passage}\n\nWhat was Dana's grandmother doing when Amina arrived?`,
            options: [{ id: 'a', label: 'Looking at photos' }, { id: 'b', label: 'Making sweets' }, { id: 'c', label: 'Preparing lunch' }, { id: 'd', label: 'Telling stories' }],
            correct: 'c',
          }),
          mc({
            text: `${passage}\n\nWhich picture shows one of the foods they had for lunch?`,
            options: [{ id: 'a', label: 'A', image: img(23) }, { id: 'b', label: 'B' }, { id: 'c', label: 'C', image: img(24) }, { id: 'd', label: 'D' }],
            correct: 'c',
          }),
          mc({
            text: `${passage}\n\nWhat did Amina learn about from the grandfather?`,
            options: [{ id: 'a', label: 'His school today' }, { id: 'b', label: 'His childhood' }, { id: 'c', label: 'How to cook Kazakh food' }, { id: 'd', label: "Dana's new friends" }],
            correct: 'b',
          }),
          mc({
            text: `${passage}\n\nPut the events in the correct order.\n1. The grandfather told stories.\n2. Amina arrived at Dana's house.\n3. The grandmother gave Amina sweets.\n4. They looked at family photos.`,
            options: [
              { id: 'a', label: '2 → 4 → 1 → 3' }, { id: 'b', label: '4 → 2 → 3 → 1' },
              { id: 'c', label: '2 → 1 → 3 → 4' }, { id: 'd', label: '3 → 2 → 4 → 1' },
            ], correct: 'a',
          }),
          tf({
            text: `${passage}\n\nIs the sentence correct?`, statement: "Dana's grandmother told the children stories about her childhood.",
            correct: false,
          }),
          mc({
            text: `${passage}\n\nHow did Amina probably feel about her visit?`,
            options: [
              { id: 'a', label: 'She wanted to leave early.' },
              { id: 'b', label: 'She did not enjoy the food.' },
              { id: 'c', label: "She enjoyed spending time with Dana's family." },
              { id: 'd', label: 'She was unhappy about the visit.' },
            ], correct: 'c',
          }),
        ]
      })(),

      // Part 3 — Almaty Arena article (Q13-20)
      ...(() => {
        const article =
          'The Almaty Arena Ice Palace is a sports and culture palace in Almaty. It opened in 2016 and is used for many different events. People come here to watch sports competitions, concerts, and other activities. The complex consists of three parts: a 12,000-seat ice arena, a skating rink and a swimming pool. There are also smaller sports halls for basketball, volleyball, and other indoor sports. Many school students visit Almaty Arena to watch games or join sports events.\n\nFamilies also enjoy visiting Almaty Arena. During weekends, people can go skating or watch exciting matches together. The arena has cafés where visitors can have a snack or a drink. There is also a large parking area, and visitors can reach the arena by bus or taxi.\n\nAlmaty Arena is an important place for sports in the city. It gives young people a chance to enjoy sports, stay active, and support their favourite teams. Many visitors say they enjoy spending time there because there is always something interesting to see or do.'
        return [
          mc({
            text: `${article}\n\nWhat is the main idea of the article?`,
            options: [
              { id: 'a', label: 'The history of Almaty city' },
              { id: 'b', label: 'A sports and entertainment centre in Almaty' },
              { id: 'c', label: 'Indoor activities in the city' },
              { id: 'd', label: 'Large parking area' },
            ], correct: 'b',
          }),
          mc({
            text: `${article}\n\nWhen did Almaty Arena open?`,
            options: [{ id: 'a', label: '2014' }, { id: 'b', label: '2016' }, { id: 'c', label: '2015' }, { id: 'd', label: '2013' }],
            correct: 'b',
          }),
          mc({
            text: `${article}\n\nWhat does the word "visitors" mean in the article?`,
            options: [
              { id: 'a', label: 'Students' }, { id: 'b', label: 'Trainers who train athletes' },
              { id: 'c', label: 'Athletes who play' }, { id: 'd', label: 'People who come to a place' },
            ], correct: 'd',
          }),
          tf({ text: `${article}\n\nMark the statement True or False.`, statement: 'Almaty Arena has a parking area and a souvenir shop.', correct: false }),
          tf({ text: `${article}\n\nMark the statement True or False.`, statement: 'Visitors can only travel by train.', correct: false }),
          matching({
            text: 'Match the place with the activity: Ice rink',
            options: [{ id: 'a', label: 'A. Have a snack' }, { id: 'b', label: 'B. Play ice hockey' }, { id: 'c', label: 'C. Play basketball' }],
            correct: 'b',
          }),
          matching({
            text: 'Match the place with the activity: Café',
            options: [{ id: 'a', label: 'A. Have a snack' }, { id: 'b', label: 'B. Play ice hockey' }, { id: 'c', label: 'C. Play basketball' }],
            correct: 'a',
          }),
          matching({
            text: 'Match the place with the activity: Sports hall',
            options: [{ id: 'a', label: 'A. Have a snack' }, { id: 'b', label: 'B. Play ice hockey' }, { id: 'c', label: 'C. Play basketball' }],
            correct: 'c',
          }),
        ]
      })(),
    ],

    writing: [
      openText({
        text: 'Your English-speaking friend, Alex, is coming to visit your city this weekend. Write a message to Alex. In your message: suggest a place to visit; say how you can get there; explain what you can do there. Write 40–50 words.',
        placeholder: 'Hi Alex...',
      }),
      openText({
        text: 'Look at the picture and write a short text (40–50 words). Include: where the people are, what they are doing, what the weather is like, how they might feel.',
        image: img(26),
        placeholder: 'In the picture...',
      }),
    ],

    speaking: [
      audioResponse({
        text: 'Personal questions. Answer: What do you usually do after school? What is your favourite place in your city? Why? How do you usually spend your weekends? Who do you like spending time with? What did you do last weekend?',
      }),
      audioResponse({
        text: 'Describe the picture. What can you see? What are the people doing? Where are they?',
        image: img(27),
      }),
      audioResponse({
        text: 'Situation. You are walking with your friend in the park. Suddenly, your friend says that he does not feel well. What should you do? Should you call someone? Why? What should you do if your friend feels worse?',
      }),
    ],
  },
}
