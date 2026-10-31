// ==================================================
// EASY EVENT EDITING
// Change the information below when our schedule changes.
// ==================================================
window.PAWS_EVENT_DATA = {
  featuredEvent: {
    active: true,
    title: "Where to Find Us",
    location: "Antioch PetSmart",
    date: "Sunday, November 1, 2026",
    time: "11 a.m. – 3 p.m.",
    address: "5879 Lone Tree Way, Antioch, CA 94531",
    mapsUrl: "https://maps.app.goo.gl/MjBjSfjpJHPXh89h7",
    attendingKittens: ["Diego", "Valentina", "Harvey", "Melody", "Raymond", "Wally"],
    description: "",
    notAttendingKittens: []
  },
  regularSchedule: {
    active: true,
    note: "Schedule is subject to change. Special adoption events and additional locations may be added.",
    locations: [
      {
        name: "Pittsburg PetSmart",
        timing: "1st & 3rd Saturday of each month",
        address: "4655 Century Blvd, Pittsburg, CA 94565",
        mapsUrl: "https://maps.app.goo.gl/FSasx3ZRVWMepJCB7"
      },
      {
        name: "Antioch PetSmart",
        timing: "2nd & 4th Saturday & Sunday of each month",
        address: "5879 Lone Tree Way, Antioch, CA 94531",
        mapsUrl: "https://maps.app.goo.gl/bDa3qbVxZ8EPSCqG6"
      }
    ]
  },
   specialEvent: {
    active: true,
    title: "Kitty Adoption Event & Yoga",
    description: "Come meet some of our adorable adoptable foster kittens at Diamond Hills Sports Club & Spa on Monday, November 9! The adoption event is open to everyone from 10 a.m. to 4 p.m. Stop by to meet the kittens, learn about adoption, and discover the wonderful cats looking for their forever homes. Diamond Hills Sports Club & Spa members can also enjoy a special Kitty Yoga class at 11:30 a.m., featuring some furry friends!",
    location: "Diamond Hills Sports Club & Spa",
    date: "Monday, November 9, 2026",
    time: "Adoption Event: 10 a.m. – 4 p.m. | Kitty Yoga: 11:30 a.m. (Members Only)",
    adoptionTime: "10 a.m. – 4 p.m.",
    yogaTime: "11:30 a.m.",
    address: "1510 Neroly Road, Oakley, CA",
    mapsUrl: "https://www.google.com/maps/search/?api=1&query=Diamond+Hills+Sports+Club+%26+Spa%2C+1510+Neroly+Road%2C+Oakley%2C+CA"
  },
  octoberNotice: {
  active: false,
  schedule: {
    enabled: true,
    start: "last-monday-of-september",
    end: "friday-before-second-weekend-of-november"
  },
  title: "October Adoption Notice",
  genericMessage: "Some kittens may be temporarily unavailable for adoption or may not attend events during this seasonal period. Thank you for your understanding as we prioritize their safety and well-being.",
  messages: [
    "During the month of October, the rescue we foster with temporarily pauses adoptions of black kittens from [start date] through [end date] to help protect them from potential harm during this time.",
    "As a result, some foster kittens will temporarily not attend adoption events. Their preferred or bonded pairs will most likely miss adoption events during this period as well, so they can be adopted together.",
    "Thank you for understanding as we prioritize the safety and well-being of our foster kittens."
  ]
}
};
