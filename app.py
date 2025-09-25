from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
import os
import json

app = Flask(__name__)
CORS(app)

# Configure Gemini API key (Ensure this is a valid key)
genai.configure(api_key="key")


@app.route("/recommend", methods=["POST"])
def recommend():
    try:
        data = request.get_json()
        answers = data.get('answers', {})
        if not answers:
            return jsonify({"error": "No answers provided"}), 400

        # Create a more structured prompt asking for JSON output
        prompt = f"""
        You are a career counselor for Indian students. Based on the following quiz answers, recommend career paths and related courses.Using RIASEC model suggest careers.
        Quiz Answers: {json.dumps(answers)}

        🔹 Rules:
        - ALWAYS provide at least 3 career paths and 3 related courses.
        - The output MUST be a single JSON object.
         -Use RIASEC model to suggest careers.

        🔹 JSON Output  example Format:
        {{
          "recommendations": [
            {{
              "title": "Software Engineering",
              "score": "82% Match",
              "description": "Build innovative software solutions.",
              "details": {{
                "avg_salary": "₹6–20 LPA",
                "growth": "Very High",
                "key_skills": ["Programming", "Problem Solving", "System Design", "AI"]
              }}
            }},
            {{
              "title": "Medicine",
              "score": "78% Match",
              "description": "Diagnose and treat patients.",
              "details": {{
                "avg_salary": "₹7–18 LPA",
                "growth": "High",
                "key_skills": ["Biology", "Empathy", "Critical Thinking", "Communication"]
              }}
            }},
            {{
              "title": "Design",
              "score": "74% Match",
              "description": "Create user-centered designs.",
              "details": {{
                "avg_salary": "₹5–12 LPA",
                "growth": "High",
                "key_skills": ["Creativity", "UI/UX", "Visual Communication", "Research"]
              }}
            }}
          ],
          "courses": [
            {{
              "title": "B.Tech Computer Science (4 Years)",
              "description": "Covers programming, AI, and software systems.",
              "eligibility": "12th PCM",
              "entrance": "JEE Main/Advanced",
              "career_scope": "Excellent"
            }},
            {{
              "title": "MBBS (5.5 Years)",
              "description": "Foundation for becoming a doctor.",
              "eligibility": "12th PCB",
              "entrance": "NEET",
              "career_scope": "Excellent"
            }},
            {{
              "title": "B.Des (4 Years)",
              "description": "Focuses on design thinking and creative skills.",
              "eligibility": "12th Any Stream",
              "entrance": "NID/CEED",
              "career_scope": "Very Good"
            }}
          ]
        }}
        """

        model = genai.GenerativeModel("gemini-1.5-flash")
        response = model.generate_content(prompt)
        
        # Parse the JSON response from the model
        try:
            # The model's response text might need some cleaning
            json_text = response.text.replace('```json', '').replace('```', '').strip()
            data = json.loads(json_text)
            
            # Extract the recommendations and return them in the correct format
            return jsonify({"recommendations": data.get("recommendations", [])})
        
        except json.JSONDecodeError as e:
            return jsonify({"error": "Failed to parse JSON from AI response: " + str(e)}), 500
            
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":

    app.run(debug=True)
