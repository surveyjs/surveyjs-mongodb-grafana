db = db.getSiblingDB('survey_db');

db.createUser({
  user: 'survey_user',
  pwd: 'userpassword',
  roles: [{ role: 'readWrite', db: 'survey_db' }]
});

db.createCollection('surveys');
db.createCollection('responses');
db.createCollection('analytics_cache');

db.responses.createIndex({ surveyId: 1 });
db.analytics_cache.createIndex({ 
  "key.surveyId": 1, 
  "key.questionId": 1 
}, { unique: true });
db.analytics_cache.createIndex({ updatedAt: 1 }, { expireAfterSeconds: 3600 });

db.surveys.insertOne({
  _id: "burger_survey_2023",
  title: "Burger Satisfaction Survey",
  description: "Survey to measure customer satisfaction with our burgers",
  createdAt: new Date(),
  questions: [
    {
      id: "q1",
      text: "How many burgers do you consume per month?",
      type: "number",
      min: 0,
      max: 100
    },
    {
      id: "q2",
      text: "When was your last burger purchase?",
      type: "date"
    },
    {
      id: "q3",
      text: "Which burger is your favorite?",
      type: "single_choice",
      options: ["Classic Cheeseburger", "BBQ Bacon", "Mushroom Swiss", "Veggie Deluxe", "Double Trouble"]
    },
    {
      id: "q4",
      text: "What toppings do you prefer? (Select all that apply)",
      type: "multiple_choice",
      options: ["Lettuce", "Tomato", "Onion", "Pickles", "Bacon", "Extra Cheese", "Avocado", "Jalapenos"]
    },
    {
      id: "q5",
      text: "Rate your overall satisfaction with our burgers",
      type: "rating",
      min: 1,
      max: 5,
      labels: {
        1: "Very Dissatisfied",
        2: "Dissatisfied",
        3: "Neutral",
        4: "Satisfied",
        5: "Very Satisfied"
      }
    },
    {
      id: "q6",
      text: "Rank the following aspects by importance (1 = Most Important)",
      type: "ranking",
      options: ["Taste", "Price", "Portion Size", "Freshness", "Presentation"]
    }
  ]
});

const responses = [
  {
    surveyId: "burger_survey_2023",
    userId: "user001",
    answers: {
      q1: 8,
      q2: new Date("2023-10-15"),
      q3: "BBQ Bacon",
      q4: ["Bacon", "Extra Cheese", "Onion"],
      q5: 5,
      q6: { "Taste": 1, "Price": 3, "Portion Size": 2, "Freshness": 4, "Presentation": 5 }
    },
    createdAt: new Date("2023-10-16T10:30:00Z")
  },
  {
    surveyId: "burger_survey_2023",
    userId: "user002",
    answers: {
      q1: 4,
      q2: new Date("2023-10-14"),
      q3: "Classic Cheeseburger",
      q4: ["Lettuce", "Tomato", "Onion", "Pickles"],
      q5: 4,
      q6: { "Price": 1, "Freshness": 2, "Taste": 3, "Portion Size": 4, "Presentation": 5 }
    },
    createdAt: new Date("2023-10-16T11:15:00Z")
  },
  {
    surveyId: "burger_survey_2023",
    userId: "user003",
    answers: {
      q1: 12,
      q2: new Date("2023-10-16"),
      q3: "Mushroom Swiss",
      q4: ["Mushrooms", "Swiss Cheese", "Onion"],
      q5: 3,
      q6: { "Freshness": 1, "Taste": 2, "Portion Size": 3, "Price": 4, "Presentation": 5 }
    },
    createdAt: new Date("2023-10-16T14:20:00Z")
  },
  {
    surveyId: "burger_survey_2023",
    userId: "user004",
    answers: {
      q1: 6,
      q2: new Date("2023-10-13"),
      q3: "Double Trouble",
      q4: ["Bacon", "Extra Cheese", "Jalapenos"],
      q5: 5,
      q6: { "Portion Size": 1, "Taste": 2, "Price": 3, "Presentation": 4, "Freshness": 5 }
    },
    createdAt: new Date("2023-10-16T15:45:00Z")
  },
  {
    surveyId: "burger_survey_2023",
    userId: "user005",
    answers: {
      q1: 3,
      q2: new Date("2023-10-16"),
      q3: "Veggie Deluxe",
      q4: ["Avocado", "Tomato", "Lettuce"],
      q5: 4,
      q6: { "Presentation": 1, "Freshness": 2, "Taste": 3, "Portion Size": 4, "Price": 5 }
    },
    createdAt: new Date("2023-10-16T16:30:00Z")
  }
];

db.responses.insertMany(responses);

const burgerSurvey = db.surveys.findOne({ _id: "burger_survey_2023" });
const questions = burgerSurvey.questions;

questions.forEach(question => {
  const stats = {};
  
  switch(question.type) {
    case "number":
      const numResult = db.responses.aggregate([
        { $match: { surveyId: "burger_survey_2023" } },
        { $group: {
          _id: null,
          avg: { $avg: `$answers.${question.id}` },
          min: { $min: `$answers.${question.id}` },
          max: { $max: `$answers.${question.id}` }
        }}
      ]).next();
      stats.value = numResult;
      break;
      
    case "single_choice":
      const choiceResult = db.responses.aggregate([
        { $match: { surveyId: "burger_survey_2023" } },
        { $group: {
          _id: `$answers.${question.id}`,
          count: { $sum: 1 }
        }}
      ]).toArray();
      stats.options = choiceResult;
      break;
      
    case "rating":
      const ratingResult = db.responses.aggregate([
        { $match: { surveyId: "burger_survey_2023" } },
        { $group: {
          _id: `$answers.${question.id}`,
          count: { $sum: 1 }
        }},
        { $sort: { _id: 1 } }
      ]).toArray();
      stats.distribution = ratingResult;
      break;
  }
  
  db.analytics_cache.insertOne({
    key: {
      surveyId: "burger_survey_2023",
      questionId: question.id
    },
    data: stats,
    updatedAt: new Date()
  });
});

print("Burger survey initialized successfully!");

// Configuration
const SURVEY_ID = 'burger_survey_2023';
const RESPONSES_COUNT = 1000;

// Survey options
const burgerOptions = [
  "Classic Cheeseburger", 
  "BBQ Bacon", 
  "Mushroom Swiss", 
  "Veggie Deluxe", 
  "Double Trouble"
];

const toppingOptions = [
  "Lettuce", "Tomato", "Onion", "Pickles", 
  "Bacon", "Extra Cheese", "Avocado", "Jalapenos"
];

const aspects = ["Taste", "Price", "Portion Size", "Freshness", "Presentation"];

// Generate random responses
function generateResponses(count) {
  const responses = [];
  const startDate = new Date(2023, 0, 1); // Jan 1, 2023
  const endDate = new Date(); // Today
  
  for (let i = 0; i < count; i++) {
    // Random date in 2023
    const randomDate = new Date(startDate.getTime() + Math.random() * 
                          (endDate.getTime() - startDate.getTime()));
    
    // Random burger consumption (0-30 per month)
    const burgersPerMonth = Math.floor(Math.random() * 31);
    
    // Random favorite burger
    const favoriteBurger = burgerOptions[
      Math.floor(Math.random() * burgerOptions.length)
    ];
    
    // Random toppings (1-5 selections)
    const toppingsCount = 1 + Math.floor(Math.random() * 5);
    const selectedToppings = toppingOptions
      .slice()
      .sort(() => 0.5 - Math.random())
      .slice(0, toppingsCount);
    
    // Random rating (1-5)
    const rating = 1 + Math.floor(Math.random() * 5);
    
    // Random ranking
    const shuffledAspects = aspects.slice().sort(() => 0.5 - Math.random());
    const ranking = {};
    shuffledAspects.forEach((aspect, index) => {
      ranking[aspect] = index + 1;
    });
    
    responses.push({
      surveyId: SURVEY_ID,
      userId: "user_" + (1000 + i),
      answers: {
        q1: burgersPerMonth,
        q2: randomDate,
        q3: favoriteBurger,
        q4: selectedToppings,
        q5: rating,
        q6: ranking
      },
      createdAt: randomDate
    });
  }
  
  return responses;
}

// Main execution
print("Generating survey responses...");
const randomResponses = generateResponses(RESPONSES_COUNT);

print("Inserting responses into database...");
const result = db.responses.insertMany(randomResponses);

print(`Successfully inserted ${result.insertedCount} responses!`);
print("Data initialization complete.");