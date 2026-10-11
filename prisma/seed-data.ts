// Static building blocks for the seed — realistic names, addresses and copy.

export const FIRST_NAMES = [
  "Alex", "Sarah", "Mike", "Priya", "David", "Elena", "James", "Grace",
  "Daniel", "Maria", "Chris", "Aisha", "Ryan", "Nina", "Tom", "Leah",
  "Omar", "Hannah", "Victor", "Sofia", "Marcus", "Ava", "Ethan", "Zoe",
  "Liam", "Chloe", "Noah", "Ruby", "Ben", "Isla", "Kofi", "Amara",
  "Diego", "Mei", "Ivan", "Farah", "Luca", "Nadia", "Sean", "Talia",
  "Wesley", "Bianca", "Andre", "Camille", "Hugo", "Yasmin", "Reuben", "Delia",
];

export const LAST_NAMES = [
  "Morgan", "Mitchell", "Johnson", "Nair", "Chen", "Rodriguez", "Whitfield",
  "Okafor", "Bennett", "Alvarez", "Park", "Hassan", "Callahan", "Petrova",
  "Fletcher", "Osei", "Reyes", "Lindqvist", "Delgado", "Romano", "Freeman",
  "Sato", "Kowalski", "Abbas", "Novak", "Brennan", "Ellison", "Adeyemi",
  "Marsh", "Vance", "Holloway", "Ibrahim", "Sinclair", "Torres", "Beckett",
];

export const PROPERTIES = [
  {
    name: "Riverside Apartments",
    addressLine: "1200 Harbor View Drive",
    city: "Portland",
    state: "OR",
    postalCode: "97209",
    yearBuilt: 2016,
    description:
      "A 48-unit mid-rise along the waterfront with shared roof deck, secure parking and an on-site gym.",
    imageUrl:
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1600&q=70",
  },
  {
    name: "Greenwood Residences",
    addressLine: "455 Maple Terrace",
    city: "Seattle",
    state: "WA",
    postalCode: "98103",
    yearBuilt: 2011,
    description:
      "Garden-style townhomes arranged around a central courtyard in the Greenwood neighborhood.",
    imageUrl:
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1600&q=70",
  },
  {
    name: "Parkview Towers",
    addressLine: "78 Lakeshore Boulevard",
    city: "Chicago",
    state: "IL",
    postalCode: "60614",
    yearBuilt: 2019,
    description:
      "Two connected high-rise towers overlooking Lincoln Park with concierge service and co-working lounge.",
    imageUrl:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1600&q=70",
  },
  {
    name: "Oak Street Homes",
    addressLine: "310 Oak Street",
    city: "Austin",
    state: "TX",
    postalCode: "78704",
    yearBuilt: 2008,
    description:
      "A cluster of single-family rental homes with private yards in the South Congress district.",
    imageUrl:
      "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=70",
  },
  {
    name: "Harborline Lofts",
    addressLine: "9 Cannery Row",
    city: "Oakland",
    state: "CA",
    postalCode: "94607",
    yearBuilt: 2014,
    description:
      "Converted warehouse loft apartments with exposed brick, high ceilings and ground-floor retail.",
    imageUrl:
      "https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=70",
  },
  {
    name: "Cedar Crossing",
    addressLine: "2044 Birchwood Lane",
    city: "Denver",
    state: "CO",
    postalCode: "80211",
    yearBuilt: 2021,
    description:
      "Newly built low-rise community near the Highland bridge with rooftop solar and EV charging.",
    imageUrl:
      "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1600&q=70",
  },
];

export const TECHNICIAN_SPECIALIZATIONS = [
  "Plumbing",
  "Electrical",
  "HVAC",
  "General repairs",
  "Appliance repair",
  "Locks & security",
  "Carpentry & structural",
  "Painting & drywall",
];

export const PROPERTY_IMAGE_FALLBACKS = [
  "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1600&q=70",
  "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=70",
];

export const TECH_AVATARS = [
  "https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?auto=format&fit=crop&w=256&q=70",
  "https://images.unsplash.com/photo-1521119989659-a83eee488004?auto=format&fit=crop&w=256&q=70",
  "https://images.unsplash.com/photo-1531384441138-2736e62e0919?auto=format&fit=crop&w=256&q=70",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=256&q=70",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=256&q=70",
  "https://images.unsplash.com/photo-1607990281513-2c110a25bd8c?auto=format&fit=crop&w=256&q=70",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&q=70",
  "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=256&q=70",
];

// category slug -> list of realistic { title, description } issue templates
export const ISSUE_TEMPLATES: Record<
  string,
  { title: string; description: string }[]
> = {
  plumbing: [
    {
      title: "Kitchen sink draining slowly",
      description:
        "The kitchen sink has been draining slower over the past week and now backs up completely when running water for more than a minute. No standing water elsewhere.",
    },
    {
      title: "Leak under bathroom vanity",
      description:
        "There is a steady drip from the pipe under the bathroom sink. I've put a bucket underneath but the cabinet floor is already water-stained.",
    },
    {
      title: "Toilet runs constantly",
      description:
        "The toilet in the main bathroom keeps running long after flushing. Jiggling the handle helps for a few minutes but it starts again.",
    },
    {
      title: "No hot water in the shower",
      description:
        "Since yesterday morning there has been no hot water in the shower. The kitchen tap still gets warm, so it may be isolated to that bathroom.",
    },
    {
      title: "Water heater making knocking noise",
      description:
        "The water heater in the utility closet has started making a loud knocking sound when it cycles on. Hot water still works for now.",
    },
  ],
  electrical: [
    {
      title: "Outlet in living room not working",
      description:
        "The double outlet on the north wall of the living room stopped working. Breaker looks fine and other outlets in the room are okay.",
    },
    {
      title: "Kitchen lights flickering",
      description:
        "The overhead kitchen lights flicker whenever the microwave or kettle is running. It's been getting worse over the last few days.",
    },
    {
      title: "Breaker trips when using bathroom heater",
      description:
        "Every time the bathroom wall heater is switched on the breaker trips within a minute. It was fine last winter.",
    },
    {
      title: "Buzzing sound from light switch",
      description:
        "The dimmer switch by the front door makes a faint buzzing sound and the plate feels slightly warm to the touch.",
    },
  ],
  hvac: [
    {
      title: "AC not cooling the apartment",
      description:
        "The air conditioning runs but only blows room-temperature air. Thermostat is set to 68 but the unit never reaches it.",
    },
    {
      title: "Heater blowing cold air",
      description:
        "The furnace turns on and the fan runs but the air coming out is cold. Filter was replaced last month.",
    },
    {
      title: "Thermostat screen is blank",
      description:
        "The thermostat display went blank overnight and none of the buttons respond. Heating and cooling are both off as a result.",
    },
    {
      title: "Loud rattling from vent",
      description:
        "There's a loud metallic rattle coming from the return vent in the hallway whenever the system is running.",
    },
  ],
  appliance: [
    {
      title: "Dishwasher not draining",
      description:
        "The dishwasher finishes its cycle but there is dirty water pooled at the bottom. Dishes come out still soiled.",
    },
    {
      title: "Refrigerator not staying cold",
      description:
        "The fridge compartment is warmer than usual and milk spoiled within two days. Freezer still seems fine.",
    },
    {
      title: "Oven not heating to temperature",
      description:
        "The oven takes over 40 minutes to preheat and never seems to get past about 300°F even when set higher.",
    },
    {
      title: "Washing machine leaking during spin",
      description:
        "The washer leaks a small puddle from the front-left corner during the spin cycle. It's fine during fill and wash.",
    },
  ],
  structural: [
    {
      title: "Cracks spreading on bedroom ceiling",
      description:
        "A hairline crack on the bedroom ceiling has widened over the past month and there's now a faint brown ring around it.",
    },
    {
      title: "Balcony railing feels loose",
      description:
        "The metal railing on the balcony wobbles when leaned on. One of the base bolts looks like it has backed out.",
    },
    {
      title: "Front door won't latch properly",
      description:
        "The front door has dropped slightly and no longer lines up with the strike plate, so it doesn't latch without lifting the handle.",
    },
    {
      title: "Water stain and soft spot on floor",
      description:
        "There's a growing water stain near the bathroom doorway and the floor feels spongy when you step on it.",
    },
  ],
  cleaning: [
    {
      title: "Mold around bathroom window",
      description:
        "Black mold has appeared along the sealant around the bathroom window and is coming back within days of cleaning it.",
    },
    {
      title: "Hallway carpet needs deep clean after move-out",
      description:
        "The shared hallway carpet on the second floor is heavily stained after the recent move-out and smells musty.",
    },
    {
      title: "Gutters overflowing with debris",
      description:
        "During the last rain the gutters over the entrance overflowed. They look packed with leaves from the tree out front.",
    },
  ],
  security: [
    {
      title: "Front building door not locking",
      description:
        "The main entrance door doesn't pull shut on its own anymore and the latch doesn't catch, so the building is unsecured overnight.",
    },
    {
      title: "Apartment deadbolt sticking",
      description:
        "The deadbolt on my unit door is very hard to turn and sometimes won't retract at all without wiggling the key.",
    },
    {
      title: "Intercom buzzer not working",
      description:
        "The intercom in my unit doesn't buzz when visitors press my button, and the door release doesn't respond either.",
    },
    {
      title: "Parking gate stuck open",
      description:
        "The garage gate has been stuck in the open position for two days. Anyone can walk or drive into the parking area.",
    },
  ],
  other: [
    {
      title: "Window won't stay open",
      description:
        "The bedroom window drops shut on its own within a few seconds. The balance mechanism on the side seems to have failed.",
    },
    {
      title: "Smoke detector chirping",
      description:
        "The smoke detector in the hallway chirps every couple of minutes. I tried a new battery but it hasn't stopped.",
    },
    {
      title: "Closet door off its track",
      description:
        "The sliding closet door in the bedroom has come off the top track and now leans against the frame.",
    },
  ],
};

export const HUMAN_COMMENTS = [
  "Thanks for the quick response. Mornings before 11am work best for access.",
  "I'll be working from home all week, so any time is fine to come by.",
  "Just checking in — is there an update on when someone can come out?",
  "The issue got a bit worse overnight, adding a photo for reference.",
  "Neighbor mentioned they had the same problem last year, might be related.",
  "I left a key with the front desk in case I'm not home.",
  "Appreciate the help — everything is working well now.",
  "Please call before arriving, the buzzer isn't reliable.",
];

export const INTERNAL_NOTES = [
  "Called tenant to confirm access window. Parts likely needed — will check van stock.",
  "Second occurrence this quarter for this unit; flag for follow-up inspection.",
  "Coordinating with building super for roof access.",
  "Ordered replacement part, ETA 2 business days. Tenant informed.",
  "Confirmed with vendor — covered under the building warranty.",
];
