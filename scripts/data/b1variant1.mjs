import { mc, tf, shortAnswer, openText, audioResponse } from '../lib/import-helpers.mjs'

const DIR = '/Users/nursultan/Desktop/work/example/test/B1 variant 1'
const img = (name) => `${DIR}/media/${name}`

// One recording covers the whole Listening section ("B1 level all parts"),
// so every listening question shares this audio and is grouped into its
// Part via content.part — the player then plays straight through all Parts.
const AUDIO = `${DIR}/B1 all parts.mp3`

// Answer key: the inline "Answers"/"Answer key" blocks next to each task in
// "LISTENING SECTION Level B1.docx" plus its "Reading. Answer Key" page. The
// yellow highlights inside the question options are NOT reliable (several sit
// one line off, e.g. Reading 18/20/21/37), and the trailing "ANSWERS" appendix
// is stale leftovers from another test (sports/knees questions) — both ignored.

const opts = (...labels) => labels.map((label, i) => ({ id: 'abcdef'[i], label }))
const letters = (n) => opts(...'ABCDEF'.slice(0, n).split(''))
const yesNo = [
  { id: 'yes', label: 'Yes' },
  { id: 'no', label: 'No' },
]
const ORDERS = ['A – B – C', 'A – C – B', 'B – A – C', 'B – C – A', 'C – A – B', 'C – B – A']
const orderOptions = ORDERS.map((label, i) => ({ id: 'abcdef'[i], label }))
const order = (seq) => 'abcdef'[ORDERS.indexOf(seq.split('').join(' – '))]

// Listening helpers — attach the shared audio and the Part number.
const L = (part, q) => ({ ...q, audio: AUDIO, content: { ...q.content, part } })

const P1_ORDER = 'Questions 1–5. Listen and put the pictures in the correct order. One picture is extra.'
const P1_BUY = 'Questions 6–10. Listen to the conversations. Will Aizhan buy the item? Choose Yes or No.'
const P2_STORY = 'Questions 11–15. Listen to the story "The Missing Backpack" and choose the correct answer.'
const P2_DIALOG = 'Questions 16–20. Listen to the conversations and choose the correct answer.'
const P3 =
  'Questions 21–30. You will hear a talk about Baiterek Tower. Complete the notes. Write NO MORE THAN TWO WORDS AND/OR A NUMBER.'
const P4 =
  "Questions 31–36. Look at the map. Follow Dana's route and complete the sentences with ONE or TWO words from the map."

const WORD_BANK = 'Choose the correct word to complete the sentence.'
const wordBank = opts('prohibited', 'pick up', 'postponed', 'continue', 'by the way', 'estimate')

const ORDER_TASK = 'Put the sentences in the correct order.'

const TAXI =
  'Driver: Askar\nArrival time: 12 minutes\nTraffic: Heavy\nDestination: Almaty Arena. The concert starts in 20 minutes. Walking to the arena takes about 25 minutes.'
const TAXI_APP =
  'Destination: Almaty Arena\nDriver arrival: 18 minutes\nTraffic: Heavy\nPhone battery: 7%\nInternet connection: Weak\nCurrent location: Wrong pickup point\nNearby metro: Very crowded\nWeather alert: Strong wind after 6:00 p.m.\nMessage from friend: "The concert starts in 25 minutes. Don\'t be late!"'
const HOTEL =
  'Hotel: Kazakhstan\nCheck-in time: Until 10:00 p.m.\nCurrent time: 9:35 p.m.\nTaxi arrival: 18 minutes\nInternet: Free Wi-Fi\nWeather alert: Heavy rain\nBooking status: Payment incomplete'

const KOKTOBE = `Last weekend, Aigerim and her cousin visited Kok-Tobe in Almaty. They went there by cable car and enjoyed the stunning view of the city. They went to Kok-Tobe with a guide, who told them about its history.

Construction of the tower began in 1978; however, the unstable dirt in the area was one of the main obstacles during this time. Upon completion, the tower reached a height of 372 meters, with the antenna mast extending an additional 114 meters. Before the 1960s, the hill of Köktöbe was referred to as Verigina. The tower was rebuilt in 2001, and following the improvements, it started to broadcast fourteen radio and television channels. Heavy rains in the spring of 2004 created soil erosion and surface fissures that put the surrounding residential areas at risk of landslides.

One of Koktobe National Park's most notable features is the 1,620-meter (1,772-yard) cable car. Riders enjoy a 250-meter elevation difference and a 6-minute ride from the lower station to the park inside roomy observation cabins. Riders can have a breathtaking experience amid the park's alluring surroundings in each cabin, which can hold up to eight people and has an adjustable speed.

The Beatles statue, which is next to the Alma Fountain and concert stage, is a well-liked photo location in Koktobe Park. It was built in 2007 and the entire Fab Four are here: John Lennon is sitting on a bench with a guitar and around him are Paul McCartney, George Harrison and Ringo Starr.

Magnificent panoramic views of the city, mountains, and the Koktobe TV Tower — a symbol of the park and city — are available from the observation deck. It is one of Almaty's tallest and most earthquake-resistant buildings, with its spire visible from many areas of the city.

Additionally, Kok-Tobe offers a Ferris wheel with breathtaking views, souvenir shops for finding the ideal way to remember Kazakhstan, and a number of viewing platforms for gazing over Almaty or across the snow-capped peaks of the Zaili Alatau Mountains.

At the end of the walk through Kok-Tobe, you can go to the fountain "Alma", which is in the form of an apple. Apples are a symbol of the city of Almaty and throwing a coin into the fountain is considered good luck.`

const KOKTOBE_PLACES = opts(
  'Offers panoramic views of Almaty',
  'Symbol of good luck',
  'Popular photo location',
  'Connects visitors to the park',
  'Gives breathtaking views'
)

export default {
  id: crypto.randomUUID(),
  name: 'B1 — Нұсқа 1',
  level: 'B1',
  isActive: true,
  // Per the test instructions: Listening ~30 min (+5 min to check answers;
  // the recording itself is 27 min), Reading 40, Writing 25, Speaking 20.
  timeLimits: { listening: 2100, reading: 2400, writing: 1500, speaking: 1200 },
  sections: {
    listening: [
      // ---------- Part 1 ----------
      L(1, mc({ text: `${P1_ORDER}\n\nWhich picture is number 1?`, image: img('listening_part1_pictures.jpg'), options: letters(6), correct: 'a' })),
      L(1, mc({ text: 'Which picture is number 2?', options: letters(6), correct: 'd' })),
      L(1, mc({ text: 'Which picture is number 3?', options: letters(6), correct: 'c' })),
      L(1, mc({ text: 'Which picture is number 4?', options: letters(6), correct: 'b' })),
      L(1, mc({ text: 'Which picture is number 5?', options: letters(6), correct: 'e' })),

      L(1, mc({ text: `${P1_BUY}\n\nElectronics`, options: yesNo, correct: 'yes' })),
      L(1, mc({ text: 'Sporting goods', options: yesNo, correct: 'no' })),
      L(1, mc({ text: 'Shoes', options: yesNo, correct: 'yes' })),
      L(1, mc({ text: 'Clothing', options: yesNo, correct: 'yes' })),
      L(1, mc({ text: 'Jewelry', options: yesNo, correct: 'no' })),

      // ---------- Part 2 ----------
      L(2, mc({ text: `${P2_STORY}\n\nWhere did Daniyar go?`, options: opts('Kok-Tobe', 'Medeu', 'Green Bazaar', 'Almaty Arena'), correct: 'b' })),
      L(2, mc({ text: 'When did they arrive?', options: opts('8:00', '9:00', '10:00', '11:00'), correct: 'c' })),
      L(2, mc({ text: 'What did Daniyar lose?', options: opts('His phone', 'His wallet', 'His jacket', 'His backpack'), correct: 'd' })),
      L(2, mc({ text: 'Where was the backpack found?', options: opts('At the café', 'At the bus station', 'On the bus', 'At Medeu'), correct: 'c' })),
      L(2, mc({ text: 'What happened in the end?', options: opts('They bought a new backpack.', 'Daniyar found his backpack.', 'They returned home immediately.', 'His phone was missing.'), correct: 'b' })),

      L(2, mc({ text: `${P2_DIALOG}\n\nWhat is Aruzhan's biggest problem?`, options: opts("She cannot remember the university's name", 'She may not finish the application on time', 'Her laptop is broken', 'She lost her documents'), correct: 'b' })),
      L(2, mc({ text: 'What problem did the woman face?', options: opts('She wanted to pay in cash', 'She had no money', 'She could pay by card', 'She forgot the Wi-Fi password'), correct: 'a' })),
      L(2, mc({ text: "Why couldn't the student register for the library?", options: opts('She could not confirm the payment', 'She could not confirm the code', 'She borrowed books', 'She lost her card'), correct: 'b' })),
      L(2, mc({ text: 'What happened at the end?', options: opts('Dias bought a T-shirt in a store', "He couldn't solve the transaction problem", 'He opened his online payment limit', 'He decided not to buy the T-shirt'), correct: 'c' })),
      L(2, mc({ text: "Why couldn't Arman buy a ticket?", options: opts('The tickets had already been sold out', 'The ticket office was closed', 'Tickets are available in their app', 'The tickets were expensive'), correct: 'a' })),

      // ---------- Part 3 ----------
      L(3, shortAnswer({ text: `${P3}\n\nThe idea of constructing Baiterek was proposed in ________.`, correct: '1999' })),
      L(3, shortAnswer({ text: 'The monument was built in ________.', correct: '2002' })),
      L(3, shortAnswer({ text: 'Baiterek is ________ metres high.', correct: ['97', 'ninety-seven', 'ninety seven'] })),
      L(3, shortAnswer({ text: 'The aquarium is ________ metres high.', correct: ['7', 'seven'] })),
      L(3, shortAnswer({ text: 'There are two fast and silent ________ inside the monument.', correct: ['elevators', 'lifts'] })),
      L(3, shortAnswer({ text: 'The palm print symbolizes peace, harmony and ________.', correct: 'unity' })),
      L(3, shortAnswer({ text: 'The upper part of Baiterek is a large glass ________.', correct: 'ball' })),
      L(3, shortAnswer({ text: 'The glass ball is ________ metres in diameter.', correct: ['22', 'twenty-two', 'twenty two'] })),
      L(3, shortAnswer({ text: 'The glass can change colour depending on the ________.', correct: ['sun', 'sunlight'] })),
      L(3, shortAnswer({ text: 'Baiterek is one of the most important and popular ________ in Kazakhstan.', correct: 'landmarks' })),

      // ---------- Part 4 ----------
      L(4, shortAnswer({ text: `${P4}\n\nDana starts at the ________.`, image: img('image7.jpg'), correct: ['metro station', 'metro'] })),
      L(4, shortAnswer({ text: 'She walks past the ________.', correct: ['bookstore', 'book store', 'bookshop'] })),
      L(4, shortAnswer({ text: 'The café is near the ________.', correct: 'school' })),
      L(4, shortAnswer({ text: 'Then, she goes to the ________.', correct: ['supermarket', 'super market'] })),
      L(4, shortAnswer({ text: 'She crosses Tole Bi Street at the ________.', correct: ['pedestrian crossing', 'crossing', 'crosswalk', 'zebra crossing'] })),
      L(4, shortAnswer({ text: 'Finally, she goes to the ________.', correct: ['bus stop', 'busstop', 'bus-stop'] })),
    ],

    reading: [
      // ---------- Part 1: word bank ----------
      mc({ text: `${WORD_BANK}\n\nAre you going to the shop? ________, buy me a bottle of water, please.`, options: wordBank, correct: 'e' }),
      mc({ text: `${WORD_BANK}\n\nDue to the heavy rain, the football match may be ________.`, options: wordBank, correct: 'c' }),
      mc({ text: `${WORD_BANK}\n\nIt is ________ to use mobile phones during the flight. Please turn them off.`, options: wordBank, correct: 'a' }),
      mc({ text: `${WORD_BANK}\n\nWe will be able to check the results online tomorrow. I ________ I did quite well this time.`, options: wordBank, correct: 'f' }),
      mc({ text: `${WORD_BANK}\n\nAs it was snowing outside, I ________ a warm jacket.`, options: wordBank, correct: 'b' }),

      // ---------- Part 2: sentence order ----------
      mc({
        text: `${ORDER_TASK}\n\nA. However, after checking the underground map carefully, she realised she had taken the wrong line.\nB. Zhanna woke up early and went to university early because she had an important presentation.\nC. As a result, she had to leave the train at the next station and change direction.`,
        options: orderOptions,
        correct: order('BAC'),
      }),
      mc({
        text: `${ORDER_TASK}\n\nA. Although the restaurant near Kok-Tobe was more expensive, the tourists still chose to eat there because of the city view.\nB. At first, they planned to have dinner at a cheaper café in the city centre.\nC. After comparing both places online, they decided the experience was worth the extra money.`,
        options: orderOptions,
        correct: order('BCA'),
      }),
      mc({
        text: `${ORDER_TASK}\n\nA. By the time he finally reached the ticket office, most seats for the evening train had already been sold out.\nB. Dias delayed buying his train ticket because he thought there would be enough seats available.\nC. Consequently, he had to choose a later train and arrived in Astana much later than expected.`,
        options: orderOptions,
        correct: order('BAC'),
      }),
      mc({
        text: `${ORDER_TASK}\n\nA. Even though the weather forecast warned about strong wind, the group still continued hiking near Shymbulak.\nB. A few hours later, the temperature suddenly dropped and visibility became poor.\nC. Looking back, they agreed they should have paid more attention to the warning.`,
        options: orderOptions,
        correct: order('ABC'),
      }),
      mc({
        text: `${ORDER_TASK}\n\nA. After speaking with local passengers, he understood that the delay was caused by technical problems on one underground line.\nB. When the train stopped for nearly twenty minutes underground, several passengers became nervous.\nC. Instead of complaining, Marat decided to remain calm and wait for further information.`,
        options: orderOptions,
        correct: order('BAC'),
      }),

      // ---------- Part 3: short texts ----------
      ...(() => {
        const t =
          'The majority of students and teenagers prefer using the underground because it is usually faster than travelling by car during rush hour. Despite having just one underground line, it links a number of significant parts of the city. The price for the underground is also affordable and offers discounts for people of different ages. The underground\'s sleek, contemporary stations are another reason why some travellers enjoy it.'
        return [
          mc({ text: `${t}\n\nWhy do young people prefer using the underground?`, options: opts('Because it is more comfortable than buses.', 'Because it is faster during traffic congestion.', 'Because it is the cheapest transport.', 'Because there is a variety of lines.'), correct: 'b' }),
          mc({ text: `${t}\n\nWhich answer is TRUE about Almaty's underground?`, options: opts('The underground is always crowded.', 'Underground stations are modern.', 'It connects different cities.', 'The ticket price is high.'), correct: 'b' }),
        ]
      })(),
      ...(() => {
        const t =
          'Last year, a group of tourists visited Kok-Tobe during the evening. In the daytime the temperature is high, and views of the city are not as impressive as when it is dark. Therefore, the guests got the best experience visiting Kok-Tobe in the evening. At first, they planned to stay for only one hour, but they spent much longer there because they enjoyed the night view of Almaty. However, the weather became colder later in the evening, so they decided to return to the city earlier than expected.'
        return [
          mc({ text: `${t}\n\nWhy did the tourists decide to visit Kok-Tobe in the evening?`, options: opts('The temperature is high during the day.', 'It was a rainy day.', 'They planned it beforehand.', 'They were in a hurry.'), correct: 'a' }),
          mc({ text: `${t}\n\nWhy did the tourists return to the city earlier?`, options: opts('They were tired.', 'The park was closed.', 'The weather became colder.', 'The tourists got bored.'), correct: 'c' }),
        ]
      })(),
      ...(() => {
        const t =
          "A foreign visitor at Green Bazaar wanted to buy traditional Kazakh sweets for his family. Although he could not speak any Kazakh or Russian, sellers helped him to choose the gift that he desired. The visitor was drawn by the market's exotic oriental atmosphere, bought chocolate and other souvenirs, and as a result gained a better understanding of the simple everyday life of the Kazakh people."
        return [
          mc({ text: `${t}\n\nWhat problem did the visitor face?`, options: opts('He could not exchange money.', 'He had culture shock.', 'He had little money.', 'He had a communication barrier.'), correct: 'd' }),
          mc({ text: `${t}\n\nHow did the sellers help him?`, options: opts('They gave him free souvenirs.', 'They helped him to choose presents.', 'They organized a good meeting for him.', 'They lowered the price.'), correct: 'b' }),
        ]
      })(),
      ...(() => {
        const t =
          'Al-Farabi KazNU is the leader in the general ranking of universities in Kazakhstan. There are many reasons to choose this university: the university provides well-equipped libraries and research centres which allow students to further explore their profession. Apart from academics, KazNU offers extracurricular activities such as debates, which allow students to compete with other talented individuals and enhance their communicative and argumentative skills.'
        return [
          mc({ text: `${t}\n\nWhy choose KazNU?`, options: opts('It has free accommodation.', 'Job opportunities are high.', 'It accepts only talented students.', 'Because of its modern libraries and facilities.'), correct: 'd' }),
          mc({ text: `${t}\n\nWhat is the main idea of the text?`, options: opts('KazNU only focuses on sports activities.', 'Al-Farabi KazNU offers academic and extracurricular opportunities.', 'Students at KazNU study abroad every year.', 'Libraries are not important for university students.'), correct: 'b' }),
        ]
      })(),
      ...(() => {
        const t =
          'Almaty Arena is a multi-purpose indoor arena located in the Alatau District of Almaty, Kazakhstan. The arena can host sports events such as ice hockey, figure skating, volleyball, and boxing. It is also used for concerts and cultural shows. Many visitors use buses or taxis to reach the arena because it is connected to major roads in the city. In recent years, famous international and Kazakh artists have performed there.'
        return [
          mc({ text: `${t}\n\nWhich activity is NOT mentioned in the text?`, options: opts('Swimming', 'Boxing', 'Figure skating', 'Ice hockey'), correct: 'a' }),
          mc({ text: `${t}\n\nWhich is true about Almaty Arena?`, options: opts('It is used only for sports.', 'It hosts different kinds of events.', 'It is the oldest arena in Kazakhstan.', 'Few people visit it.'), correct: 'b' }),
        ]
      })(),

      // ---------- Part 4: read the information ----------
      mc({ text: `${TAXI}\n\nWhat is the MOST likely problem?`, options: opts('The driver is lost', 'They may arrive late', 'The concert was cancelled', 'Walking is faster than driving'), correct: 'b' }),
      mc({ text: `${TAXI}\n\nWhat should the passenger MOST likely do?`, options: opts('Cancel the taxi and walk', 'Wait for the driver because there is enough time', 'Leave earlier for the next concert', 'Change the destination to another place'), correct: 'a' }),
      mc({ text: `${TAXI_APP}\n\nWhat is the passenger's biggest problem?`, image: img('image8.jpg'), options: opts('The concert ticket is expensive', 'Several conditions may make him late', 'The metro station is closed', 'The weather is sunny'), correct: 'b' }),
      mc({ text: `${TAXI_APP}\n\nWhat should the passenger do FIRST?`, image: img('image8.jpg'), options: opts('Wait silently for the driver', 'Check and correct the pickup location', 'Go to the crowded metro immediately', 'Turn off the phone'), correct: 'b' }),
      mc({ text: `${TAXI_APP}\n\nWhich factor is NOT directly related to transportation?`, image: img('image8.jpg'), options: opts('Weather warning', 'Low battery', 'Heavy traffic', 'Wrong pickup point'), correct: 'b' }),
      mc({ text: `${HOTEL}\n\nWhy is the traveller worried?`, options: opts('He cannot confirm his booking', 'The hotel has poor rooms', 'The rooms are small', 'No free rooms are left'), correct: 'a' }),
      mc({ text: `${HOTEL}\n\nWhat should the traveller do first?`, options: opts('Cancel the taxi', 'Search for another hotel', 'Confirm the payment', 'Wait until the next day'), correct: 'c' }),
      mc({ text: `${HOTEL}\n\nWhat can be inferred from the information?`, options: opts('The traveller has plenty of time', 'The hotel booking is cancelled', 'The taxi has already arrived', 'Several small problems may create stress'), correct: 'd' }),

      // ---------- Part 5: Kok-Tobe ----------
      mc({ text: `${KOKTOBE}\n\nMatch the place with the correct description: Observation deck`, options: KOKTOBE_PLACES, correct: 'a' }),
      mc({ text: `${KOKTOBE}\n\nMatch the place with the correct description: Alma fountain`, options: KOKTOBE_PLACES, correct: 'b' }),
      mc({ text: `${KOKTOBE}\n\nMatch the place with the correct description: Ferris wheel`, options: KOKTOBE_PLACES, correct: 'e' }),

      tf({ text: `${KOKTOBE}\n\nIs the sentence true or false?`, statement: 'The Kok-Tobe tower was rebuilt in 2001.', correct: true }),
      tf({ text: `${KOKTOBE}\n\nIs the sentence true or false?`, statement: 'The cable car ride takes around six minutes.', correct: true }),
      tf({ text: `${KOKTOBE}\n\nIs the sentence true or false?`, statement: 'The Beatles statue was built before 2000.', correct: false }),
      tf({ text: `${KOKTOBE}\n\nIs the sentence true or false?`, statement: 'The Kok-Tobe cable car can hold up to eight people in one cabin.', correct: true }),

      mc({ text: `${KOKTOBE}\n\nThe word "broadcast" means:`, options: opts('to get a beautiful view', 'to show on TV or radio', 'to reach the peak', 'to get a breathtaking experience'), correct: 'b' }),
      mc({ text: `${KOKTOBE}\n\nThe word "panoramic" means:`, options: opts('very small', 'underground', 'wide and beautiful', 'dangerous'), correct: 'c' }),
      mc({ text: `${KOKTOBE}\n\nThe word "alluring" is closest in meaning to:`, options: opts('attractive', 'noisy', 'crowded', 'traditional'), correct: 'a' }),
      mc({ text: `${KOKTOBE}\n\nThe word "adjustable" means:`, options: opts('impossible to change', 'easy to break', 'able to be changed', 'expensive to repair'), correct: 'c' }),
      mc({ text: `${KOKTOBE}\n\nThe word "surface" means:`, options: opts('outer layer', 'bottom', 'depth', 'inside'), correct: 'a' }),
    ],

    writing: [
      openText({
        text: 'Task 1. Write an email to your friend in England. Invite him to visit Kazakhstan. Write 80–100 words.\n\n• Divide your letter into paragraphs.\n• Avoid colloquial language and short forms.',
        placeholder: 'Dear ...,',
      }),
      openText({
        text: 'Task 2. Write an article for your school magazine: "The Importance of Dombra in Kazakh Culture" (120–150 words).\n\nInclude:\n• history\n• modern use\n• why young people should learn it',
        image: img('image12.jpg'),
        placeholder: 'The dombra is...',
      }),
    ],

    speaking: [
      audioResponse({
        text: 'Part 1. Look at Pictures A and B. What places are shown in the pictures? Describe each picture.',
        image: img('image13.jpg'),
      }),
      audioResponse({
        text: 'Part 2. Where would you prefer to live — in place A or place B? Why? Discuss the pros and cons of each place. Speak for 2–3 minutes and express your ideas clearly.',
        image: img('image13.jpg'),
      }),
    ],
  },
}
