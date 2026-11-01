// ==========================================
// KITTEN CARDS AND PROFILE DETAILS — EDIT HERE
// Add one object per kitten. Use empty strings or [] for details not ready yet.
// Photos should live in assets/kittens/.
// ==========================================
const appRoot = typeof window !== "undefined" ? window : globalThis;

appRoot.PAWS_KITTEN_STATUSES = {
  AVAILABLE: "Available",
  RETURNED_AVAILABLE: "Returned — Available",
  PENDING_INTEREST: "Pending Interest",
  ALMOST_AVAILABLE: "Almost Available",
  PRE_ADOPTED: "Pre-Adopted",
  COMING_SOON: "Coming Soon",
  ADOPTED: "Adopted"
};

appRoot.PAWS_AVAILABLE_KITTEN_STATUSES = new Set([
  appRoot.PAWS_KITTEN_STATUSES.AVAILABLE,
  appRoot.PAWS_KITTEN_STATUSES.RETURNED_AVAILABLE,
  appRoot.PAWS_KITTEN_STATUSES.PENDING_INTEREST
]);

appRoot.PAWS_KITTENS = [
  {
    "id": "diego",
    "name": "Diego",
    "status": "Available",
    "adoptionStatus": "Available",
    "description": "Diego is a super outgoing and playful kitten who loves being involved in every activity.",
    "image": "assets/kittens/Diego-halloween.jpg",
    "profileUrl": "kittens/profile-template.html?id=diego",
    "gender": "Male",
    "birthday": "2026-03-24",
    "litterNumber": 11,
    "bio": "Meet Diego! He is a super outgoing and playful kitten who spends most of his time running, jumping, wrestling, and climbing with his siblings. Diego loves carrying toys in his mouth and showing them off to anyone. He is social, enjoys being around people, and always wants to be a part of whatever is going on. He loves attention and often puts himself right in the middle of everything just to be involved.",
    "photos": [
      "assets/kittens/diego-main.png",
      "assets/kittens/Diego-2.jpg",
      "assets/kittens/Diego-3.jpg",
      "assets/kittens/Diego-Paw.jpg",
      "assets/kittens/Diego-collage.jpg",
      "assets/kittens/Diego-4.png"
    ],
    "personalityTraits": [
      "Outgoing",
      "Playful",
      "Social",
      "Active",
      "Attention-loving",
      "Loves other cats"
    ],
    "idealHome": "Diego will do best in a loving home where he can get plenty of attention, affection, and opportunities to play. He's a playful, cuddly boy who would be happy with a single person or a family, with or without children. He should be fine with other cats with a proper introduction, and while he hasn't had direct experience with dogs, he may do well with a calm, cat-friendly dog if introductions are handled patiently. Most of all, Diego wants a home where he'll be loved, included, and given all the cuddles and attention he could ask for.",
    "compatibility": {
      "dogs": "Unknown — no direct experience",
      "cats": "Yes — with proper introduction",
      "youngerChildren": "Possibly — no direct experience",
      "olderChildren": "Yes"
    },
    "healthChecklist": [
      "Neutered",
      "Fully vaccinated",
      "Dewormed",
      "Flea treated",
      "Microchipped",
      "Fostered and socialized"
    ],
    "adoptionRequirements": [],
    "petfinderUrl": "https://www.petfinder.com/cat/diego-050b5d9b-599c-4483-98fc-b2957135ac14/ca/oakley/no-paws-left-behind-kitty-rescue-ca3018/details/",
    "whereToMeet": "",
    "videoUrl": "",
    "eventInformation": "",
    "pairing": {
      "type": "bonded",
      "kittenId": "valentina"
    }
  },
  {
    "id": "valentina",
    "name": "Valentina",
    "status": "Available",
    "adoptionStatus": "Available",
    "description": "A confident and affectionate kitten who loves attention and keeps the room full of energy.",
    "image": "assets/kittens/Valentina-halloween.jpg",
    "profileUrl": "kittens/profile-template.html?id=valentina",
    "gender": "Female",
    "birthday": "2026-03-24",
    "litterNumber": 11,
    "bio": "Meet Valentina! She's a confident and playful kitten who loves exploring and being curious about everything around her. Valentina is not afraid of much and will often walk right up to people asking for attention. She enjoys being around people and is very social, often purring almost instantly when being pet. She's affectionate and playful and truly the best of both worlds. Valentina is also a chatterbox and loves talking to people. She's very vocal and always has something to say. She also absolutely loves walking on a harness and is amazing with it.",
    "photos": [
      "assets/kittens/Valentina-1.png",
      "assets/kittens/Valentina-2.jpg",
      "assets/kittens/Valentina.4.jpg",
      "assets/kittens/Valentina-Paw.jpg",
      "assets/kittens/Valentina-collage.jpg",
      "assets/kittens/Valentina.3.png"
    ],
    "personalityTraits": [
      "Confident",
      "Playful",
      "Curious",
      "Social",
      "Affectionate",
      "Vocal"
    ],
    "idealHome": "Valentina will do best in a loving home where she can get plenty of attention, affection, and cuddles. She's a sweet, affectionate girl who would be happy with a single person or a family, with or without children. She may do well with children, although she hasn't had direct experience with them. She should be fine with other cats with a proper introduction, and while she hasn't had direct experience with dogs, she may do well with a calm, cat-friendly dog if introductions are handled patiently. Most of all, Valentina wants a home where she'll be loved, included, and given all the cuddles and attention she could ask for.",
    "compatibility": {
      "dogs": "Unknown — no direct experience",
      "cats": "Yes — with proper introduction",
      "youngerChildren": "Possibly — no direct experience",
      "olderChildren": "Yes"
    },
    "healthChecklist": [
      "Spayed",
      "Fully vaccinated",
      "Dewormed",
      "Flea treated",
      "Microchipped",
      "Fostered and socialized"
    ],
    "adoptionRequirements": [],
    "petfinderUrl": "https://www.petfinder.com/cat/valentina-5a9bf649-de45-4bcf-b4d1-e47000b82ce7/ca/oakley/no-paws-left-behind-kitty-rescue-ca3018/details/",
    "whereToMeet": "",
    "videoUrl": "",
    "eventInformation": "",
    "pairing": {
      "type": "bonded",
      "kittenId": "diego"
    }
  },
  {
    "id": "claudia",
    "name": "Claudia",
    "status": "Available",
    "adoptionStatus": "Available",
    "description": "A sweet kitten with a calm personality who enjoys quiet attention and gentle play.",
    "image": "assets/kittens/Claudia-halloween.jpg",
    "profileUrl": "kittens/profile-template.html?id=claudia",
    "gender": "Female",
    "birthday": "2026-03-24",
    "litterNumber": 11,
    "bio": "Meet Claudia! She is on the more timid side when first exploring new spaces, but that does not stop her from being a playful and energetic kitten. She loves playing and wrestling with her siblings and never sits out on the fun, always chasing toys and anything that moves. Once she is comfortable, she is very affectionate, enjoys pets, and will often purr loudly. At the end of the day, she often chooses to sleep right next to you.",
    "photos": [
      "assets/kittens/claudia-main.png",
      "assets/kittens/claudia-1793504031844-1.jpg",
      "assets/kittens/claudia-photo-2.png",
      "assets/kittens/claudia-photo-3.png",
      "assets/kittens/claudia-photo-4.png",
      "assets/kittens/claudia-photo-5.png"
    ],
    "personalityTraits": [
      "Timid at first",
      "Playful",
      "Energetic",
      "Affectionate",
      "Sweet",
      "Loving"
    ],
    "idealHome": "Claudia will do best in a patient, loving home that gives her the time and space she needs to feel comfortable. She can be shy at first, but once she feels safe, her sweet and gentle personality begins to shine. She would benefit from people who let her build trust at her own pace and show her that she is loved. She may do well with children, although she hasn't had direct experience with them. She hasn't had direct experience with dogs either, so any introductions should be slow and patient. She can also live with other cats with a proper introduction. Claudia deserves a home where she can settle in, gain confidence, and become the affectionate companion she's meant to be.",
    "compatibility": {
      "cats": "Yes — with proper introduction",
      "dogs": "Unknown — no direct experience",
      "youngerChildren": "Possibly — no direct experience",
      "olderChildren": "Yes"
    },
    "healthChecklist": [
      "Spayed",
      "Fully vaccinated",
      "Dewormed",
      "Flea treated",
      "Microchipped",
      "Fostered and socialized"
    ],
    "adoptionRequirements": [],
    "petfinderUrl": "https://www.petfinder.com/cat/claudia-ab77cbff-645f-41c9-9920-514a578d8796/ca/oakley/no-paws-left-behind-kitty-rescue-ca3018/details/",
    "whereToMeet": "",
    "videoUrl": "",
    "eventInformation": "",
    "pairing": {
      "type": "bonded",
      "kittenId": "paloma"
    },
    "blackCatAdoptionNotice": true,
    "pairingDescription": "Claudia and Paloma are biological sisters who are incredibly bonded and are always together. They love playing, chasing each other, and curling up together for naps. You will often find one right behind the other, and their close bond makes them an extra special pair to welcome into your home."
  },
  {
    "id": "paloma",
    "name": "Paloma",
    "status": "Available",
    "adoptionStatus": "Available",
    "description": "A curious and friendly kitten who loves exploring and then settling in for cuddles.",
    "image": "assets/kittens/Paloma-halloween.jpg",
    "profileUrl": "kittens/profile-template.html?id=paloma",
    "gender": "Female",
    "birthday": "2026-03-24",
    "litterNumber": 11,
    "bio": "Meet Paloma! She is a sweet and gentle kitten who may be shy when meeting new people, but she warms up quickly. Once comfortable, she is affectionate and loves curling up beside you for attention. She is calmer than her siblings and enjoys relaxing with her favorite people. She also loves kneading soft blankets, giving morning kisses, and cuddling with you at night.",
    "photos": [
      "assets/kittens/paloma-main.png",
      "assets/kittens/paloma-1793504031855-2.jpg",
      "assets/kittens/paloma-photo-2.png",
      "assets/kittens/paloma-photo-3.png",
      "assets/kittens/paloma-photo-4.png",
      "assets/kittens/paloma-photo-5.png"
    ],
    "personalityTraits": [
      "Sweet",
      "Gentle",
      "Shy at first",
      "Calm",
      "Affectionate",
      "Cuddly"
    ],
    "idealHome": "Paloma would do best in a home that is willing to give her time and patience to adjust. She may be shy when first meeting someone or entering a new environment, but once she feels comfortable, her sweet and affectionate personality will show.",
    "compatibility": {
      "dogs": "Unknown — no direct experience",
      "cats": "Yes — with proper introduction",
      "youngerChildren": "Possibly — no direct experience",
      "olderChildren": "Yes"
    },
    "healthChecklist": [
      "Spayed",
      "Fully vaccinated",
      "Dewormed",
      "Flea treated",
      "Microchipped",
      "Fostered and socialized"
    ],
    "adoptionRequirements": [],
    "petfinderUrl": "https://www.petfinder.com/cat/paloma-4a4706d0-5d49-4ff9-bd0a-c969e5d121c0/ca/oakley/no-paws-left-behind-kitty-rescue-ca3018/details/",
    "whereToMeet": "",
    "videoUrl": "",
    "eventInformation": "",
    "pairing": {
      "type": "bonded",
      "kittenId": "claudia"
    },
    "pairingDescription": "Claudia and Paloma are sisters with a special bond and are rarely far apart. They follow each other everywhere, love chasing and playing together, and curl up side by side for naps. They are two super sweet kittens with so much love to give to their future family."
  },
  {
    "id": "harvey",
    "name": "Harvey",
    "status": "Available",
    "adoptionStatus": "Available",
    "description": "A playful and people-focused kitten who is always ready to follow the action.",
    "image": "assets/kittens/Harvey-halloween.jpg",
    "profileUrl": "kittens/profile-template.html?id=harvey",
    "gender": "Male",
    "birthday": "2026-04-19",
    "litterNumber": 12,
    "bio": "Meet Harvey! Harvey is a very affectionate kitten who loves people and is happiest when he is being held or included in whatever is going on around him. He loves to play and enjoys just about every toy you can offer, but once he has worn himself out, he is happiest making biscuits on a soft blanket nearby. He is very food motivated and gets super excited for mealtimes.",
    "photos": [
      "assets/kittens/harvey-main.png",
      "assets/kittens/harvey-1793504031862-3.jpg",
      "assets/kittens/harvey-photo-2.png",
      "assets/kittens/harvey-photo-3.png",
      "assets/kittens/harvey-photo-4.png",
      "assets/kittens/harvey-photo-5.png"
    ],
    "personalityTraits": [
      "Affectionate",
      "People-loving",
      "Playful",
      "Cuddly",
      "Food motivated",
      "Sweet"
    ],
    "idealHome": "Harvey will do best in a loving home with people who are ready for a very sweet kitten with lots of love to give. He would be happy with older children or even a single person who wants a cuddly companion. He's full of love and affection, and he hopes his future family is ready for all the sweetness he has to share. He should do well with other cats with a proper introduction, but a home without dogs and preferably without young children would be best for him. Most of all, Harvey wants a home where he'll be loved, cuddled, and treated like part of the family.",
    "compatibility": {
      "dogs": "No",
      "cats": "Yes — with proper introduction",
      "youngerChildren": "No",
      "olderChildren": "Yes"
    },
    "healthChecklist": [
      "Neutered",
      "Fully vaccinated",
      "Dewormed",
      "Flea treated",
      "Microchipped",
      "Fostered and socialized"
    ],
    "adoptionRequirements": [],
    "petfinderUrl": "https://www.petfinder.com/cat/harvey-0f0b98a2-0b47-4449-97eb-349c1c9500b6/ca/oakley/no-paws-left-behind-kitty-rescue-ca3018/details/",
    "whereToMeet": "",
    "videoUrl": "",
    "eventInformation": "",
    "pairing": {
      "type": "bonded",
      "kittenId": "melody"
    },
    "pairingDescription": "Harvey and Melody are siblings, and these two tuxedo kittens are the sweetest twin duo! They love grooming each other, napping together, and playing side by side. When you see one, the other is never far behind."
  },
  {
    "id": "melody",
    "name": "Melody",
    "status": "Available",
    "adoptionStatus": "Available",
    "description": "A bright, lively kitten with a sweet nature and an affectionate personality.",
    "image": "assets/kittens/Melody-halloween.jpg",
    "profileUrl": "kittens/profile-template.html?id=melody",
    "gender": "Female",
    "birthday": "2026-04-19",
    "litterNumber": 12,
    "bio": "Meet Melody! Melody is a sweet, confident, and incredibly affectionate kitten who absolutely adores people—they are her whole world. She loves being involved in whatever you are doing, being held, and following her people around. Although she is smaller than her siblings, her tiny size does not hold her back in the slightest. She is fearless, playful, and always ready to join in the fun.",
    "photos": [
      "assets/kittens/melody-main.png",
      "assets/kittens/melody-photo-2.png",
      "assets/kittens/melody-photo-3.png",
      "assets/kittens/melody-photo-4.png",
      "assets/kittens/melody-photo-5.png",
      "assets/kittens/melody-photo-6.png"
    ],
    "personalityTraits": [
      "Sweet",
      "Confident",
      "Affectionate",
      "People-loving",
      "Fearless",
      "Playful"
    ],
    "idealHome": "Melody will do best in a loving home with people who are ready to give her plenty of love, attention, and cuddles. She's a very sweet girl who would be happy with older children or a single person looking for an affectionate companion. She has so much love to share and hopes her future family is ready for all her cuddles and sweetness. She should be fine with other cats with a proper introduction, but a home without dogs would be best for her. Most of all, Melody wants a home where she'll feel safe, loved, and included as part of the family.",
    "compatibility": {
      "dogs": "No",
      "cats": "Yes — with proper introduction",
      "youngerChildren": "No",
      "olderChildren": "Yes"
    },
    "healthChecklist": [
      "Spayed",
      "Fully vaccinated",
      "Dewormed",
      "Flea treated",
      "Microchipped",
      "Fostered and socialized"
    ],
    "adoptionRequirements": [],
    "petfinderUrl": "https://www.petfinder.com/cat/melody-e047bf81-ef41-4456-8ec4-b212aa61f721/ca/oakley/no-paws-left-behind-kitty-rescue-ca3018/details/",
    "whereToMeet": "",
    "videoUrl": "",
    "eventInformation": "",
    "pairing": {
      "type": "bonded",
      "kittenId": "harvey"
    },
    "pairingDescription": "Melody and Harvey are brother and sister, and they are the sweetest twin tuxedo kitten pair ever! They are very bonded and enjoy grooming one another, playing together, and curling up for naps. When one is around, the other is usually close by."
  },
  {
    "id": "wally",
    "name": "Wally",
    "status": "Returned — Available",
    "adoptionStatus": "Returned — Available",
    "description": "A curious kitten who enjoys exploring, playing, and making himself part of the family.",
    "image": "assets/kittens/Wally-halloween.jpg",
    "profileUrl": "kittens/profile-template.html?id=wally",
    "gender": "Male",
    "birthday": "2026-02-16",
    "litterNumber": 10,
    "bio": "Meet Wally! Wally is a timid boy who may need a little time to adjust, but with patience, you’ll get to see what a truly sweet kitten he is. He loves getting pets and will rub against your legs when he wants some attention. When he is especially happy, he may even flop right over! Wally loves to play, purr, and spend time with his people. Once he knows you, he really enjoys being near you and soaking up all the love he can get.\n\nWally was previously adopted and has since returned to foster care. He is not being returned because of a behavior problem — he is simply a very sweet, affectionate boy who has lots of love to give and does best with people who are willing to give him the time and patience he needs to feel comfortable.",
    "photos": [
      "assets/kittens/wally-main.png",
      "assets/kittens/wally-photo-2.png",
      "assets/kittens/wally-photo-3.png",
      "assets/kittens/wally-photo-4.png",
      "assets/kittens/wally-1793504031889-4.jpg",
      "assets/kittens/wally-1793504031889-4.jpg"
    ],
    "personalityTraits": [
      "Timid at first",
      "Sweet",
      "Affectionate",
      "Playful",
      "People-loving",
      "Cuddly"
    ],
    "idealHome": "Wally would do best in a patient home that understands he may need some time to settle into a new environment. Once he feels comfortable, his affectionate and loving personality really comes through. He would prefer to be the only cat in the home, but he can be okay with other cats with a proper introduction. He would be happy with older children and people who enjoy having a very affectionate companion.",
    "compatibility": {
      "dogs": "No",
      "cats": "Yes — prefers to be the only cat, but can be okay with other cats with proper introduction",
      "youngerChildren": "No",
      "olderChildren": "Yes"
    },
    "healthChecklist": [
      "Neutered",
      "Fully vaccinated",
      "Dewormed",
      "Flea treated",
      "Microchipped",
      "Fostered and socialized"
    ],
    "adoptionRequirements": [],
    "petfinderUrl": "https://www.petfinder.com/cat/wally-064a5676-3e7c-430d-a699-37ba466c2400/ca/oakley/no-paws-left-behind-kitty-rescue-ca3018/details/",
    "whereToMeet": "",
    "videoUrl": "",
    "eventInformation": "",
    "pairing": {
      "type": "bonded",
      "kittenId": "raymond"
    },
    "pairingDescription": "Wally and Raymond have been together since they were about 10 weeks old and have formed an incredibly strong bond. Raymond helps Wally feel confident and comfortable, while Wally is happiest when his brother is nearby. They play together, nap together, and look to each other for comfort, so they need to find a home together."
  },
  {
    "id": "raymond",
    "name": "Raymond",
    "status": "Returned — Available",
    "adoptionStatus": "Returned — Available",
    "description": "A gentle, social kitten who loves people and turns every room into a new adventure.",
    "image": "assets/kittens/Raymond-halloween.jpg",
    "profileUrl": "kittens/profile-template.html?id=raymond",
    "gender": "Male",
    "birthday": "2026-02-09",
    "litterNumber": 10,
    "bio": "Meet Raymond! He is a very affectionate, playful boy who absolutely loves being around people. Raymond loves being petted and has the loudest purrs when he’s getting attention, and he’s always happy to play and spend time with his people. He may need a little time to adjust to a new environment, but once he feels comfortable, his sweet personality really shines through. Raymond was previously adopted and has since returned to foster care. This was not because of a behavior problem—he is simply an exceptionally affectionate, people-loving boy with lots of love and attention to give.",
    "photos": [
      "assets/kittens/raymond-main.png",
      "assets/kittens/raymond-photo-2.png",
      "assets/kittens/raymond-photo-3.png",
      "assets/kittens/raymond-photo-4.png",
      "assets/kittens/raymond-1793504031906-6.jpg",
      "assets/kittens/raymond-1793504031917-6.jpg"
    ],
    "personalityTraits": [
      "Affectionate",
      "Playful",
      "People-loving",
      "Sweet",
      "Cuddly",
      "Social"
    ],
    "idealHome": "Raymond would do best in a patient home that understands he may need some time to settle into a new environment. Once he feels comfortable, his affectionate and loving personality really comes through. He would prefer to be the only cat in the home, but he can be okay with other cats with a proper introduction. He would be happy with older children and people who enjoy having a very affectionate companion.",
    "compatibility": {
      "dogs": "No",
      "cats": "Yes — prefers to be the only cat, but can be okay with other cats with proper introduction",
      "youngerChildren": "No",
      "olderChildren": "Yes"
    },
    "healthChecklist": [
      "Neutered",
      "Fully vaccinated",
      "Dewormed",
      "Flea treated",
      "Microchipped",
      "Fostered and socialized"
    ],
    "adoptionRequirements": [],
    "petfinderUrl": "https://www.petfinder.com/cat/raymond-eaad2ec5-2d15-41d5-9967-5abc10225e8d/ca/oakley/no-paws-left-behind-kitty-rescue-ca3018/details/",
    "whereToMeet": "",
    "videoUrl": "",
    "eventInformation": "",
    "pairing": {
      "type": "bonded",
      "kittenId": "wally"
    },
    "pairingDescription": "Raymond and Wally are foster brothers who have been together since they were 10 weeks old and bonded almost right away. As a bonded pair, they are deeply attached and count on each other to feel confident and comfortable; they do just about everything together. They should not be separated and need to be adopted as a pair."
  }
];

if (typeof module !== "undefined") {
  module.exports = {
    PAWS_KITTEN_STATUSES: appRoot.PAWS_KITTEN_STATUSES,
    PAWS_AVAILABLE_KITTEN_STATUSES: appRoot.PAWS_AVAILABLE_KITTEN_STATUSES,
    PAWS_KITTENS: appRoot.PAWS_KITTENS
  };
}
