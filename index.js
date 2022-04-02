const TelegramBot = require("node-telegram-bot-api");
require("dotenv").config();
const axios = require("axios");

const token = process.env.TELEGRAM_TOKEN;

const bot = new TelegramBot(token, { polling: true });

let data, chatId;

const semesterListUrl = `http://software.diu.edu.bd:8189/result/semesterList`;

// find details about the user, semester and result
const findDetails = async (studentId, semester) => {
  let semesterId;
  let semesterDetails;

  try {
    const userUrl = `http://software.diu.edu.bd:8189/result/studentInfo?studentId=${studentId}`;
    const user = await axios.get(userUrl);
    data = `Name: ${user.data.studentName}\nProgram: ${user.data.progShortName}\n`;
  } catch (ex) {
    bot.sendMessage(chatId, `Student id not found. Follow the instructions.`);
  }

  try {
    semesterDetails = await axios.get(semesterListUrl);
  } catch (ex) {
    bot.sendMessage(
      chatId,
      `The server is busy with too many requests. Please try again after some time.`
    );
  }

  // check semester is available or not
  for (let i = 0; i < semesterDetails.data.length; i++) {
    if (
      semesterDetails.data[i].semesterName === semester[0] &&
      semesterDetails.data[i].semesterYear === parseInt(semester[1])
    ) {
      semesterId = semesterDetails.data[i].semesterId;
    }
  }

  if (semesterId === null || semesterId === undefined) {
    bot.sendMessage(
      chatId,
      `❎ The semester is not found\n\nSemesterName Format:\n✅Fall-Year\n✅Summer-Year\n✅Spring-Year\n\n\n✅Please follow the instractions to see your result:\n\nSemesterName<space>YourID\n\nExample: Fall-2021 181-15-10894\n\nEnjoy 🎉\nAny confusion DM @mhnahib`
    );
  }

  // result url
  const resultUrl = `http://software.diu.edu.bd:8189/result?grecaptcha=&semesterId=${semesterId}&studentId=${studentId}`;

  let result;
  try {
    result = await axios.get(resultUrl);
  } catch (ex) {
    bot.sendMessage(
      chatId,
      `The server is busy with too many requests. Please try again after some time.`
    );
  }

  data += `Student Id: ${studentId}`;

  // add data
  if (result.data.length > 0) {
    if (result.data[0].cgpa === null) {
      data += "\nCGPA: Teaching evaluation is pending\n";
    } else {
      data += `\nCGPA: ${result.data[0].cgpa}\n`;
    }
    for (let i = 0; i < result.data.length; i++) {
      data += `\nCourse code: ${result.data[i].customCourseId}\nCourse title: ${result.data[i].courseTitle}\nGread: ${result.data[i].gradeLetter}\n`;
    }
  } else {
    data += `\nNo data found!`;
  }

  bot.sendMessage(chatId, data);
};

const checkMessage = (message) => {
  const instractions = `Assalamu alaikum,\nI'm DIU Result Bot developed by M. H. Nahib\n\nSemesterName Format:\n✅Fall-Year\n✅Summer-Year\n✅Spring-Year\n\n\n✅Please follow the instractions to see your result:\n\nSemesterName<space>YourID\n\nExample: Fall-2021 181-15-10894\n\nEnjoy 🎉\nAny confusion DM @mhnahib`;
  let data;
  if (message === "/start") {
    bot.sendMessage(chatId, instractions);
  } else {
    message.replace(/\s+/g, " ").trim();
    const splitData = message.split(" ");
    const studentId = splitData[1];
    const semester = splitData[0].split("-");
    findDetails(studentId, semester);
  }
};

bot.on("message", (message) => {
  chatId = message.from.id;

  checkMessage(message.text);
});
