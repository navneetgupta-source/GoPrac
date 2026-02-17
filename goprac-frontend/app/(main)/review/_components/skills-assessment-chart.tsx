"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface SkillScore {
  name: string;
  score: number;
  idealScore: number;
  maxScore: number;
}

export default function SkillsAssessmentChart({
  candidateSpecificRatings,
  candidateSpecificDS,
  industryExpectationRating,
  industryExpectationDS,
}: any) {
  // console.log("candidateSpecificRatings", industryExpectationRating);

  //   const skills: SkillScore[] = [
  //     { name: "Analytical & Critical Thinking", score: 1, idealScore: 7, maxScore: 10 },
  //     { name: "Problem Solving Skill", score: 6, idealScore: 8, maxScore: 10 },
  //     { name: "Problem Understanding", score: 1, idealScore: 7, maxScore: 10 },
  //   ]
  let userSkills = candidateSpecificRatings;
  let averageSkills = industryExpectationRating;

  if (candidateSpecificDS && industryExpectationDS) {
    userSkills = [...userSkills, ...candidateSpecificDS];
    averageSkills = [...averageSkills, ...industryExpectationDS];
  }

  let avgSkillMap;

  if (averageSkills.length > 0) {
    avgSkillMap = new Map(
      averageSkills.map((s) => [s.key_skill, s.avg_overall_rating])
    );
  }
  // Create map using key_skill
  let skills: SkillScore[];

  if (userSkills) {
    // Final merged skills array
    skills = userSkills.map((s) => ({
      name: s.key_skill,
      score: Number(s.overallRating),
      idealScore: Number(avgSkillMap.get(s.key_skill) || 0),
      maxScore: 10,
    }));

    // console.log(skills);

  }

  return (
    <div className="w-full max-w-3xl">
      <div className="relative">
        <div className="space-y-6 mb-6">
          {skills &&
            skills.map((skill) => (
              <div key={skill.name} className="space-y-2">
                <div className="flex justify-between items-center ml-4">
                  <span className="text-sm font-medium">{skill.name}</span>
                  <span className="text-sm font-medium">{skill.score}</span>
                </div>
                <div className="relative">
                  <div className="h-3 bg-blue-100 w-full relative rounded-r-xl">
                    <div
                      className="h-full bg-primary rounded-r-md"
                      style={{
                        width: `${(skill.score / skill.maxScore) * 100}%`,
                      }}
                    ></div>
                  </div>
                  {/* Ideal score marker */}
                  <div
                    className="absolute top-[-30%] bottom-0 w-0.5 bg-black z-10"
                    style={{
                      left: `${(skill.idealScore / skill.maxScore) * 100}%`,
                      height: "160%",
                    }}
                  >
                    {/* <div className="absolute -top-6 -translate-x-1/2 text-xs font-medium text-black">
                    {skill.idealScore}
                  </div> */}
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Single scale for all skills */}
        {skills && (
          <div className="relative pt-4 border-t border-gray-200">
            <div className="flex justify-between px-0">
              {Array.from({ length: 10 + 1 }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                  <div className="h-2 w-0.5 bg-gray-400"></div>
                  <span className="text-xs text-gray-500 mt-1">{i}</span>
                </div>
              ))}
            </div>
            <div className="flex justify-center">
              <div className="space-x-4 mx-auto">
                <span className="text-xs text-center mt-4 text-gray-500">
                  Score Scale (0-10)
                </span>
                <span className=" border-l-2 border-black text-xs text-gray-500 px-1">
                  industry expectations
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Vertical line at 0 */}
        <div className="absolute left-0 top-0 bottom-12 w-[1px] bg-gray-300"></div>
      </div>
    </div>
  );
}
