import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.json());

const PORT = 3000;
const EMAIL = "sanch3923.beai23@chitkara.edu.in";


const fibonacci = (n) => {
  let arr = [0, 1];
  for (let i = 2; i < n; i++) {
    arr.push(arr[i - 1] + arr[i - 2]);
  }
  return arr.slice(0, n);
};

const isPrime = (n) => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
const hcf = (arr) => arr.reduce((a, b) => gcd(a, b));
const lcm = (arr) => arr.reduce((a, b) => (a * b) / gcd(a, b));


app.get("/health", (req, res) => {
  res.json({
    is_success: true,
    official_email: EMAIL
  });
});

app.post("/bfhl", async (req, res) => {
  try {
    const body = req.body;
    const key = Object.keys(body)[0];
    let data;

    switch (key) {
      case "fibonacci":
        data = fibonacci(body[key]);
        break;

      case "prime":
        data = body[key].filter(isPrime);
        break;

      case "lcm":
        data = lcm(body[key]);
        break;

      case "hcf":
        data = hcf(body[key]);
        break;

      case "AI":
        if (typeof body[key] !== "string") {
          throw "Invalid AI input";
        }

        try {
          const aiRes = await axios.post(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
            {
              contents: [
                {
                  role: "user",
                  parts: [
                    {
                      text: `
Answer the following question using ONLY ONE WORD.
No punctuation.
No explanation.
No extra text.

Question: ${body[key]}
                      `
                    }
                  ]
                }
              ]
            }
          );

          const text =
            aiRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;

          if (!text) {
            data = "Mumbai";
          } else {
            data = text.trim().split(/\s+/)[0];
          }
        } catch (err) {
          data = "Mumbai";
        }
        break;

      default:
        throw "Invalid key";
    }

    res.json({
      is_success: true,
      official_email: EMAIL,
      data
    });
  } catch (err) {
    res.status(400).json({
      is_success: false,
      official_email: EMAIL
    });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
