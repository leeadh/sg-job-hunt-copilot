// Static fallback data — used when data.gov.sg API is unavailable.
// Primary source is now live API: src/lib/salary-api.ts
// Last updated manually: 2024 cohort from NUS/NTU/SMU/SUTD/SIT GES

export interface SalaryBenchmark {
  field: string;
  degree: string;
  medianSalary: number;
  p25Salary: number;
  p75Salary: number;
  employmentRate: number;
  source: string;
}

export const SALARY_BENCHMARKS: SalaryBenchmark[] = [
  // Computing & Tech
  { field: "Computer Science", degree: "Bachelor's", medianSalary: 5500, p25Salary: 4800, p75Salary: 6500, employmentRate: 91.2, source: "NUS/NTU GES 2024" },
  { field: "Information Systems", degree: "Bachelor's", medianSalary: 5200, p25Salary: 4500, p75Salary: 6000, employmentRate: 90.5, source: "NUS/SMU GES 2024" },
  { field: "Data Science / Analytics", degree: "Bachelor's", medianSalary: 5300, p25Salary: 4600, p75Salary: 6200, employmentRate: 89.8, source: "NUS/NTU GES 2024" },
  { field: "Cybersecurity", degree: "Bachelor's", medianSalary: 5000, p25Salary: 4500, p75Salary: 5800, employmentRate: 93.1, source: "SIT GES 2024" },
  { field: "Software Engineering", degree: "Bachelor's", medianSalary: 5400, p25Salary: 4700, p75Salary: 6300, employmentRate: 92.0, source: "NTU/SUTD GES 2024" },

  // Engineering
  { field: "Electrical Engineering", degree: "Bachelor's", medianSalary: 4500, p25Salary: 3800, p75Salary: 5200, employmentRate: 88.0, source: "NUS/NTU GES 2024" },
  { field: "Mechanical Engineering", degree: "Bachelor's", medianSalary: 4300, p25Salary: 3700, p75Salary: 5000, employmentRate: 86.5, source: "NUS/NTU GES 2024" },
  { field: "Chemical Engineering", degree: "Bachelor's", medianSalary: 4400, p25Salary: 3800, p75Salary: 5100, employmentRate: 85.2, source: "NUS/NTU GES 2024" },
  { field: "Civil Engineering", degree: "Bachelor's", medianSalary: 4200, p25Salary: 3600, p75Salary: 4800, employmentRate: 84.0, source: "NUS/NTU GES 2024" },
  { field: "Industrial & Systems Engineering", degree: "Bachelor's", medianSalary: 4600, p25Salary: 4000, p75Salary: 5300, employmentRate: 89.0, source: "NUS GES 2024" },

  // Business
  { field: "Business Administration", degree: "Bachelor's", medianSalary: 4200, p25Salary: 3600, p75Salary: 5000, employmentRate: 89.5, source: "NUS/NTU/SMU GES 2024" },
  { field: "Accountancy", degree: "Bachelor's", medianSalary: 4000, p25Salary: 3500, p75Salary: 4500, employmentRate: 92.3, source: "NUS/NTU/SMU GES 2024" },
  { field: "Finance", degree: "Bachelor's", medianSalary: 4800, p25Salary: 4000, p75Salary: 5500, employmentRate: 88.0, source: "NUS/SMU GES 2024" },
  { field: "Economics", degree: "Bachelor's", medianSalary: 4300, p25Salary: 3700, p75Salary: 5100, employmentRate: 87.0, source: "NUS/NTU/SMU GES 2024" },
  { field: "Marketing", degree: "Bachelor's", medianSalary: 3800, p25Salary: 3300, p75Salary: 4400, employmentRate: 85.0, source: "NUS/NTU/SMU GES 2024" },

  // Sciences
  { field: "Biological Sciences", degree: "Bachelor's", medianSalary: 3600, p25Salary: 3000, p75Salary: 4200, employmentRate: 78.0, source: "NUS/NTU GES 2024" },
  { field: "Chemistry", degree: "Bachelor's", medianSalary: 3500, p25Salary: 3000, p75Salary: 4000, employmentRate: 76.5, source: "NUS/NTU GES 2024" },
  { field: "Physics", degree: "Bachelor's", medianSalary: 3800, p25Salary: 3200, p75Salary: 4500, employmentRate: 80.0, source: "NUS/NTU GES 2024" },
  { field: "Mathematics", degree: "Bachelor's", medianSalary: 4500, p25Salary: 3800, p75Salary: 5200, employmentRate: 85.0, source: "NUS/NTU GES 2024" },
  { field: "Environmental Science", degree: "Bachelor's", medianSalary: 3400, p25Salary: 2900, p75Salary: 4000, employmentRate: 75.0, source: "NUS/NTU GES 2024" },

  // Arts & Social Sciences
  { field: "Communications / Media", degree: "Bachelor's", medianSalary: 3800, p25Salary: 3200, p75Salary: 4500, employmentRate: 82.0, source: "NUS/NTU GES 2024" },
  { field: "Psychology", degree: "Bachelor's", medianSalary: 3500, p25Salary: 3000, p75Salary: 4200, employmentRate: 78.5, source: "NUS/NTU/SMU GES 2024" },
  { field: "Political Science", degree: "Bachelor's", medianSalary: 3600, p25Salary: 3000, p75Salary: 4300, employmentRate: 80.0, source: "NUS/SMU GES 2024" },
  { field: "Law", degree: "Bachelor's", medianSalary: 5700, p25Salary: 5000, p75Salary: 6500, employmentRate: 95.0, source: "NUS/SMU GES 2024" },
  { field: "Architecture", degree: "Bachelor's", medianSalary: 3800, p25Salary: 3300, p75Salary: 4300, employmentRate: 83.0, source: "NUS/SUTD GES 2024" },

  // Healthcare
  { field: "Medicine", degree: "Bachelor's", medianSalary: 5500, p25Salary: 5200, p75Salary: 6500, employmentRate: 99.0, source: "NUS/NTU GES 2024" },
  { field: "Nursing", degree: "Bachelor's", medianSalary: 4000, p25Salary: 3600, p75Salary: 4400, employmentRate: 97.0, source: "NUS/SIT GES 2024" },
  { field: "Pharmacy", degree: "Bachelor's", medianSalary: 4200, p25Salary: 3800, p75Salary: 4600, employmentRate: 96.0, source: "NUS GES 2024" },
  { field: "Dentistry", degree: "Bachelor's", medianSalary: 5300, p25Salary: 5000, p75Salary: 6000, employmentRate: 98.5, source: "NUS GES 2024" },

  // Polytechnic / Diploma
  { field: "IT / Computing", degree: "Diploma", medianSalary: 2800, p25Salary: 2400, p75Salary: 3200, employmentRate: 82.0, source: "MOM Labour Force Survey 2024" },
  { field: "Engineering", degree: "Diploma", medianSalary: 2600, p25Salary: 2200, p75Salary: 3000, employmentRate: 78.0, source: "MOM Labour Force Survey 2024" },
  { field: "Business", degree: "Diploma", medianSalary: 2500, p25Salary: 2100, p75Salary: 2900, employmentRate: 80.0, source: "MOM Labour Force Survey 2024" },
  { field: "Design / Media", degree: "Diploma", medianSalary: 2400, p25Salary: 2000, p75Salary: 2800, employmentRate: 75.0, source: "MOM Labour Force Survey 2024" },
  { field: "Health Sciences", degree: "Diploma", medianSalary: 2700, p25Salary: 2300, p75Salary: 3100, employmentRate: 85.0, source: "MOM Labour Force Survey 2024" },
];

export function findSalaryBenchmark(field: string, degree?: string): SalaryBenchmark[] {
  const normalizedField = field.toLowerCase();
  return SALARY_BENCHMARKS.filter(b => {
    const matchField = b.field.toLowerCase().includes(normalizedField) ||
      normalizedField.includes(b.field.toLowerCase());
    const matchDegree = !degree || b.degree.toLowerCase().includes(degree.toLowerCase());
    return matchField && matchDegree;
  });
}

export function getSalaryPercentile(salary: number, benchmark: SalaryBenchmark): string {
  if (salary <= benchmark.p25Salary) return "bottom 25%";
  if (salary <= benchmark.medianSalary) return "25th–50th percentile";
  if (salary <= benchmark.p75Salary) return "50th–75th percentile";
  return "top 25%";
}
