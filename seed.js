// seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const bcrypt = require('bcryptjs');

const User = require('./models/User');
const Course = require('./models/Course');
const Lesson = require('./models/Lesson');
const Question = require('./models/Question');
const Badge = require('./models/Badge');
const Enrollment = require('./models/Enrollment');

async function seed() {
  await connectDB(process.env.MONGO_URI);

  // Clear existing data (optional – comment out if you want to keep existing)
  // await Promise.all([
  //   User.deleteMany({}),
  //   Course.deleteMany({}),
  //   Lesson.deleteMany({}),
  //   Question.deleteMany({}),
  //   Badge.deleteMany({}),
  //   Enrollment.deleteMany({})
  // ]);

  // Create badges
  const badges = [
    { name: 'Getting Started', description: 'Earn 50 points', condition: 'points>=50', icon: 'star' },
    { name: 'First Win', description: 'Answer first question correctly', condition: 'first_correct', icon: 'trophy' },
    { name: 'Rising Star', description: 'Earn 100 points', condition: 'points>=100', icon: 'rocket' },
    { name: 'Master of Loops', description: 'High mastery of loops', condition: 'mastery_loops>=80', icon: 'loop' }
  ];

  for (const b of badges) {
    const found = await Badge.findOne({ name: b.name });
    if (!found) await new Badge(b).save();
  }

  // Create 4 lecturers for levels 100–400
  const levels = ['100', '200', '300', '400'];
  const lecturers = [];
  for (const level of levels) {
    const email = `lecturer${level}@example.com`;
    let lecturer = await User.findOne({ email });
    if (!lecturer) {
      const passwordHash = await bcrypt.hash('LectPass123', 10);
      lecturer = await User.create({
        name: `Lecturer ${level}`,
        email,
        passwordHash,
        role: 'lecturer',
        department: 'Software Engineering',
        learningStyle: 'Detailed',
        studyTime: 'Afternoon'
      });
      console.log(`Created lecturer for level ${level}`);
    }
    lecturers.push({ level, lecturer });
  }

  // Create a sample student
  let student = await User.findOne({ email: 'student1@example.com' });
  if (!student) {
    const passwordHash = await bcrypt.hash('P@ssword123', 10);
    student = await User.create({
      name: 'Student One',
      email: 'student1@example.com',
      passwordHash,
      role: 'student',
      department: 'Software Engineering',
      learningStyle: 'Short & Quick',
      studyTime: 'Night'
    });
    console.log('Created student');
  }

  // Create admin user
let admin = await User.findOne({ email: 'admin@example.com' });
if (!admin) {
  const adminPass = await bcrypt.hash('AdminPass123', 10);
  admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    passwordHash: adminPass,
    role: 'admin',
    department: 'Administration'
  });
  console.log('Created admin');
}


  // For each lecturer, create a course for their level
  for (const { level, lecturer } of lecturers) {
    const courseTitle = `Software Engineering ${level} Level`;
    let course = await Course.findOne({ title: courseTitle });
    if (!course) {
      course = await Course.create({
        title: courseTitle,
        description: `Comprehensive course for ${level} level covering core concepts.`,
        level,
        duration: level === '100' ? '4 weeks' : level === '200' ? '6 weeks' : '8 weeks',
        lecturer: lecturer._id,
        lessons: []
      });
      console.log(`Created course: ${courseTitle}`);
    }

    // Create 2 lessons per course
    for (let i = 1; i <= 2; i++) {
      const lessonTitle = `Module ${i}: ${level} Level Concepts`;
      let lesson = await Lesson.findOne({ title: lessonTitle, course: course._id });
      if (!lesson) {
        lesson = await Lesson.create({
          title: lessonTitle,
          content: `This is the content for module ${i} of ${level} level.`,
          course: course._id,
          concepts: [level === '100' ? 'basics' : level === '200' ? 'intermediate' : 'advanced'],
          order: i,
          files: [
            {
              filename: `sample-${level}-module${i}.pdf`,
              url: `https://example.com/pdfs/sample-${level}-module${i}.pdf` // mock URL
            }
          ]
        });
        course.lessons.push(lesson._id);
        console.log(`Created lesson: ${lessonTitle}`);

        // Create 3 questions for each lesson
        const qdata = [
          {
            text: `Sample question 1 for ${level} module ${i}`,
            type: 'mcq',
            choices: [
              { text: 'Option A', correct: true },
              { text: 'Option B', correct: false },
              { text: 'Option C', correct: false }
            ],
            difficulty: level === '100' ? 1 : level === '200' ? 2 : 3,
            concepts: [level === '100' ? 'basics' : 'advanced'],
            points: 10
          },
          {
            text: `Sample question 2 for ${level} module ${i}`,
            type: 'mcq',
            choices: [
              { text: 'Choice 1', correct: false },
              { text: 'Choice 2', correct: true },
              { text: 'Choice 3', correct: false }
            ],
            difficulty: level === '100' ? 1 : level === '200' ? 2 : 3,
            concepts: [level === '100' ? 'basics' : 'advanced'],
            points: 10
          },
          {
            text: `Sample short answer for ${level} module ${i}`,
            type: 'short',
            answer: 'correct answer',
            difficulty: 1,
            concepts: ['basics'],
            points: 5
          }
        ];

        for (const q of qdata) {
          const found = await Question.findOne({ text: q.text, lesson: lesson._id });
          if (!found) {
            const created = await Question.create({ ...q, lesson: lesson._id });
            lesson.questions.push(created._id);
          }
        }
        await lesson.save();
      }
    }
    await course.save();
  }

  console.log('Seeding complete!');
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});

