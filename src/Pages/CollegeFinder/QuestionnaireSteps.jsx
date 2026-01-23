// src/components/questionnaire/QuestionnaireSteps.jsx
import React, { memo } from 'react';
import { InputField } from './InputField';
import { Lightbulb } from 'lucide-react';

const Field = (props) => (
  <div className="flex flex-col justify-start">
    <InputField {...props} />
  </div>
);

const ReadyBox = ({ dataValidation }) => (
  <div className="mt-8 bg-[#145044]/5 border border-[#145044]/20 rounded-lg p-4">
    <div className="flex items-start space-x-3">
      <Lightbulb className="h-5 w-5 text-[#145044] mt-0.5 flex-shrink-0" />
      <div>
        <h4 className="font-medium text-[#145044] mb-1">Ready for AI Analysis</h4>
        <p className="text-sm text-gray-600">
          Click “Get Universities” – our AI will match you with{' '}
          {dataValidation?.stats?.totalRecords ?? '1000+'} real programs.
        </p>
      </div>
    </div>
  </div>
);

const Step1 = memo(({ formData, errors, handleInputChange }) => (
  <div className="space-y-4" key={formData.degreeLevel}>
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Degree Level Selection</h2>
      <p className="text-gray-600 text-sm">Are you applying for a Bachelor's or Master's program?</p>
    </div>
    <div>
      <Field
        label="Q1. Degree Level"
        field="degreeLevel"
        type="radio"
        options={['Bachelor', 'Master']}
        required
        value={formData.degreeLevel}
        onChange={handleInputChange}
        hasError={!!errors.degreeLevel}
      />
      {errors.degreeLevel && (
        <p className="text-red-500 text-sm mt-1 ml-1">{errors.degreeLevel}</p>
      )}
    </div>
  </div>
));

const Step2 = memo(({ formData, errors, handleInputChange }) => {
  const isMaster = formData.degreeLevel === 'Master';
  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Program/Major Selection</h2>
        {/* <p className="text-gray-600 text-sm">Which program/major do you want to apply for?</p> */}
      </div>
      <Field
        label="Q2. Select program/major do you want to apply for?"
        field="program"
        type="select"
        options={isMaster
          ? ['MS in Computer Science', 'MS in Data Science', 'MS in Business Analytics', 'MS in Artificial Intelligence', 'MS in Cybersecurity', 'MS in Information Systems', 'MS in Software Engineering', 'MS in Electrical Engineering', 'MS in Mechanical Engineering','MS in Industrial Engineering','MS in Civil Engineering','MS in Computer Engineering','MS in Engineering Management','MS in Finance','MS in Accounting','MS in Economics','MS in Public Health','MS in Biotechnology','MS in Environmental Science','MS in Marketing Analytics','MBA']
          : ['Computer Science', 'Business', 'Biology', 'Design']}
        required
        value={formData.program}
        onChange={handleInputChange}
        hasError={!!errors.program}
      />
    </div>
  );
});

const Step3 = memo(({ formData, errors, handleInputChange }) => (
  <div className="space-y-4">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Intake Mode Selection</h2>
      <p className="text-gray-600 text-sm">Choose your questionnaire type</p>
    </div>
    <Field
      label="Q3. Do you want Base Questions (short intake) or Advanced Questions (detailed intake)?"
      field="intakeMode"
      type="radio"
      // options={['Base Questions (Quick)', 'Advanced Questions (Detailed)']}
      options={['Base Questions (Quick)']}

      required
      value={formData.intakeMode}
      onChange={handleInputChange}
      hasError={!!errors.intakeMode}
    />
  </div>
));

const Step4Master = memo(({ formData, errors, handleInputChange }) => (
  <div className="space-y-2">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Part 1</h2>
      <p className="text-gray-600 text-sm">Essential requirements and eligibility</p>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <Field label="Q3. Do you require only STEM-designated programs?" field="stemRequired" type="radio" options={['Yes', 'No']} required value={formData.stemRequired} onChange={handleInputChange} hasError={!!errors.stemRequired} />
      <Field label="Q4. Do you require only F-1 visa eligible programs?" field="f1Required" type="radio" options={['Yes', 'No']} required value={formData.f1Required} onChange={handleInputChange} hasError={!!errors.f1Required} />
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <Field label="Q5. What is your undergraduate GPA?" field="gpa" type="number" placeholder="e.g., 3.5 or 8.5" required value={formData.gpa} onChange={handleInputChange} hasError={!!errors.gpa} />
      <Field label="GPA Scale" field="gpaScale" type="select" options={['4.0', '10.0', 'Percentage']} required value={formData.gpaScale} onChange={handleInputChange} hasError={!!errors.gpaScale} />
    </div>
    <Field label="Q6. What is the name of your undergraduate university?" field="university" placeholder="e.g., IIT Delhi" required value={formData.university} onChange={handleInputChange} hasError={!!errors.university} />
  </div>
));

const Step4Bachelor = memo(({ formData, errors, handleInputChange }) => (
  <div className="space-y-2">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Part 1</h2>
      <p className="text-gray-600 text-sm">Essential requirements and eligibility</p>
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <Field label="Q3. Do you prefer only STEM-designated majors for OPT extension?" field="stemRequired" type="radio" options={['Yes', 'No']} required value={formData.stemRequired} onChange={handleInputChange} hasError={!!errors.stemRequired} />
      <Field label="Q4. Do you require F-1 visa eligible programs only?" field="f1Required" type="radio" options={['Yes', 'No']} required value={formData.f1Required} onChange={handleInputChange} hasError={!!errors.f1Required} />
    </div>
    <div className="grid md:grid-cols-2 gap-4">
      <Field label="Q5. What is your school board?" field="schoolBoard" type="select" options={['CBSE', 'ICSE', 'State Board']} required value={formData.schoolBoard} onChange={handleInputChange} hasError={!!errors.schoolBoard} />
      <Field label="Q6. What is your average/predicted marks for class (9-12)" field="averageMarks" type="number" placeholder="e.g., 85%" required value={formData.averageMarks} onChange={handleInputChange} hasError={!!errors.averageMarks} />
    </div>
  </div>
));

const Step5Master = memo(({ formData, errors, handleInputChange }) => (
  <div className="space-y-2">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Part 2</h2>
      <p className="text-gray-600 text-sm">Academic background and degree information</p>
    </div>
    <Field label="Q7. What is the tier of your university?" field="universityTier" type="select" options={['IIT', 'NIT', 'Tier-1', 'Tier-2', 'Tier-3']} required value={formData.universityTier} onChange={handleInputChange} hasError={!!errors.universityTier} />
    <Field label="Q8. What is the name of your undergraduate degree?" field="undergradDegree" placeholder="e.g., Computer Science" required value={formData.undergradDegree} onChange={handleInputChange} hasError={!!errors.undergradDegree} />
    {/* {(formData.program === 'MSCS' || formData.program === 'MS Data Science') && (
      <Field label="Q9. Did your degree include Mathematics, Programming, and Statistics coursework?" field="mathProgrammingStats" type="radio" options={['Yes', 'No']} required value={formData.mathProgrammingStats} onChange={handleInputChange} hasError={!!errors.mathProgrammingStats} />
    )} */}
    <div className="grid md:grid-cols-2 gap-4">
      <Field label="Q9. Was your undergraduate program 3 years or 4 years?" field="degreeLength" type="select" options={['3 years', '4 years']} required value={formData.degreeLength} onChange={handleInputChange} hasError={!!errors.degreeLength} />
      <Field label="Q10. Have you completed any master's degree?" field="mastersDegree" type="radio" options={['Yes', 'No']} required value={formData.mastersDegree} onChange={handleInputChange} hasError={!!errors.mastersDegree} />
    </div>
  </div>
));

const Step5Bachelor = memo(({ formData, errors, handleInputChange }) => (
  <div className="space-y-2">
    <div className="text-center">
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Base Questions - Part 2</h2>
      <p className="text-gray-600 text-sm">Standardized test scores</p>
    </div>
    <Field
      label="Q7. Have you taken or do you plan to take the SAT/ACT?"
      field="testTaken"
      type="radio"
      options={['Taken', 'Planning']}
      required
      value={formData.testTaken}
      onChange={handleInputChange}
      hasError={!!errors.testTaken}
    />
    <div className="grid md:grid-cols-2 gap-4">
      <Field label="Q8. SAT Score" field="satScore" type="number" placeholder="e.g., 1400" value={formData.satScore} onChange={handleInputChange} />
      <Field label="Q9. ACT Score" field="actScore" type="number" placeholder="e.g., 30" value={formData.actScore} onChange={handleInputChange} />
    </div>
  </div>
));
const Step6EnglishTests = memo(({ formData, errors, handleInputChange, setErrors, isMaster }) => { // Destructure isMaster
  const canEdit = formData.englishTest === 'Yes';
  const englishQNumber = isMaster ? 11 : 10; // Dynamic: 12 for Master (after Q11), 10 for Bachelor (after Q9)

  const handleTestChange = (field, value) => {
    handleInputChange(field, value);
    if (value === 'No') {
      handleInputChange('toefl', { reading: '', writing: '', speaking: '', listening: '' });
      handleInputChange('ielts', { reading: '', writing: '', speaking: '', listening: '' });
      handleInputChange('duolingo', { reading: '', writing: '', speaking: '', listening: '', total: '' }); // Include total if needed
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.englishTest;
        return newErrors;
      });
    }
  };

  const handleSubfield = (test, sub, val) => {
    handleInputChange(test, { ...formData[test], [sub]: val });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">English Proficiency Tests</h2>
        <p className="text-gray-600 text-sm">TOEFL, IELTS, or Duolingo scores</p>
      </div>

      <div>
        <Field
          label={`Q${englishQNumber}. Do you have TOEFL / IELTS / Duolingo scores?`} // Dynamic Q number
          field="englishTest"
          type="radio"
          options={['Yes', 'No']}
          value={formData.englishTest}
          onChange={handleTestChange}
          hasError={!!errors.englishTest}
        />
        {errors.englishTest && (
          <p className="text-red-500 text-sm mt-1 ml-1">{errors.englishTest}</p>
        )}
      </div>

      {canEdit && (
        <div className="space-y-6">
          {/* TOEFL */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-3">TOEFL</h3>
            <div className="grid md:grid-cols-4 gap-3">
              <Field label="Reading" field="toefl.reading" type="number" placeholder="e.g., 28" value={formData.toefl.reading} onChange={(_, v) => handleSubfield('toefl', 'reading', v)} />
              <Field label="Writing" field="toefl.writing" type="number" placeholder="e.g., 26" value={formData.toefl.writing} onChange={(_, v) => handleSubfield('toefl', 'writing', v)} />
              <Field label="Speaking" field="toefl.speaking" type="number" placeholder="e.g., 25" value={formData.toefl.speaking} onChange={(_, v) => handleSubfield('toefl', 'speaking', v)} />
              <Field label="Listening" field="toefl.listening" type="number" placeholder="e.g., 27" value={formData.toefl.listening} onChange={(_, v) => handleSubfield('toefl', 'listening', v)} />
            </div>
          </div>

          {/* IELTS */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-3">IELTS</h3>
            <div className="grid md:grid-cols-4 gap-3">
              <Field label="Reading" field="ielts.reading" type="number" placeholder="e.g., 7.5" value={formData.ielts.reading} onChange={(_, v) => handleSubfield('ielts', 'reading', v)} />
              <Field label="Writing" field="ielts.writing" type="number" placeholder="e.g., 7.0" value={formData.ielts.writing} onChange={(_, v) => handleSubfield('ielts', 'writing', v)} />
              <Field label="Speaking" field="ielts.speaking" type="number" placeholder="e.g., 7.0" value={formData.ielts.speaking} onChange={(_, v) => handleSubfield('ielts', 'speaking', v)} />
              <Field label="Listening" field="ielts.listening" type="number" placeholder="e.g., 8.0" value={formData.ielts.listening} onChange={(_, v) => handleSubfield('ielts', 'listening', v)} />
            </div>
          </div>

          {/* Duolingo */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-medium mb-3">Duolingo</h3>
            <div className="grid md:grid-cols-4 gap-3">
              <Field label="Reading" field="duolingo.reading" type="number" placeholder="e.g., 125" value={formData.duolingo.reading} onChange={(_, v) => handleSubfield('duolingo', 'reading', v)} />
              <Field label="Writing" field="duolingo.writing" type="number" placeholder="e.g., 120" value={formData.duolingo.writing} onChange={(_, v) => handleSubfield('duolingo', 'writing', v)} />
              <Field label="Speaking" field="duolingo.speaking" type="number" placeholder="e.g., 115" value={formData.duolingo.speaking} onChange={(_, v) => handleSubfield('duolingo', 'speaking', v)} />
              <Field label="Listening" field="duolingo.listening" type="number" placeholder="e.g., 130" value={formData.duolingo.listening} onChange={(_, v) => handleSubfield('duolingo', 'listening', v)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// const Step6EnglishTests = memo(({ formData, errors, handleInputChange, setErrors }) => {
//   const canEdit = formData.englishTest === 'Yes';

//   const handleTestChange = (field, value) => {
//     handleInputChange(field, value);
//     if (value === 'No') {
//       handleInputChange('toefl', { reading: '', writing: '', speaking: '', listening: '' });
//       handleInputChange('ielts', { reading: '', writing: '', speaking: '', listening: '' });
//       handleInputChange('duolingo', { reading: '', writing: '', speaking: '', listening: '' });
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors.englishTest;
//         return newErrors;
//       });
//     }
//   };

//   const handleSubfield = (test, sub, val) => {
//     handleInputChange(test, { ...formData[test], [sub]: val });
//   };

//   return (
//     <div className="space-y-6">
//       <div className="text-center">
//         <h2 className="text-xl font-semibold text-gray-900 mb-2">English Proficiency Tests</h2>
//         <p className="text-gray-600 text-sm">TOEFL, IELTS, or Duolingo scores</p>
//       </div>

//       <div>
//         <Field
//           label="Q10. Do you have TOEFL / IELTS / Duolingo scores?"
//           field="englishTest"
//           type="radio"
//           options={['Yes', 'No']}
//           value={formData.englishTest}
//           onChange={handleTestChange}
//           hasError={!!errors.englishTest}
//         />
//         {errors.englishTest && (
//           <p className="text-red-500 text-sm mt-1 ml-1">{errors.englishTest}</p>
//         )}
//       </div>

//       {canEdit && (
//         <div className="space-y-6">
//           {/* TOEFL */}
//           <div className="border rounded-lg p-4 bg-gray-50">
//             <h3 className="font-medium mb-3">TOEFL</h3>
//             <div className="grid md:grid-cols-4 gap-3">
//               <Field label="Reading" field="toefl.reading" type="number" placeholder="e.g., 28" value={formData.toefl.reading} onChange={(_, v) => handleSubfield('toefl', 'reading', v)} />
//               <Field label="Writing" field="toefl.writing" type="number" placeholder="e.g., 26" value={formData.toefl.writing} onChange={(_, v) => handleSubfield('toefl', 'writing', v)} />
//               <Field label="Speaking" field="toefl.speaking" type="number" placeholder="e.g., 25" value={formData.toefl.speaking} onChange={(_, v) => handleSubfield('toefl', 'speaking', v)} />
//               <Field label="Listening" field="toefl.listening" type="number" placeholder="e.g., 27" value={formData.toefl.listening} onChange={(_, v) => handleSubfield('toefl', 'listening', v)} />
//             </div>
//           </div>

//           {/* IELTS */}
//           <div className="border rounded-lg p-4 bg-gray-50">
//             <h3 className="font-medium mb-3">IELTS</h3>
//             <div className="grid md:grid-cols-4 gap-3">
//               <Field label="Reading" field="ielts.reading" type="number" placeholder="e.g., 7.5" value={formData.ielts.reading} onChange={(_, v) => handleSubfield('ielts', 'reading', v)} />
//               <Field label="Writing" field="ielts.writing" type="number" placeholder="e.g., 7.0" value={formData.ielts.writing} onChange={(_, v) => handleSubfield('ielts', 'writing', v)} />
//               <Field label="Speaking" field="ielts.speaking" type="number" placeholder="e.g., 7.0" value={formData.ielts.speaking} onChange={(_, v) => handleSubfield('ielts', 'speaking', v)} />
//               <Field label="Listening" field="ielts.listening" type="number" placeholder="e.g., 8.0" value={formData.ielts.listening} onChange={(_, v) => handleSubfield('ielts', 'listening', v)} />
//             </div>
//           </div>

//           {/* Duolingo */}
//           <div className="border rounded-lg p-4 bg-gray-50">
//             <h3 className="font-medium mb-3">Duolingo</h3>
//             <div className="grid md:grid-cols-4 gap-3">
//               <Field label="Reading" field="duolingo.reading" type="number" placeholder="e.g., 125" value={formData.duolingo.reading} onChange={(_, v) => handleSubfield('duolingo', 'reading', v)} />
//               <Field label="Writing" field="duolingo.writing" type="number" placeholder="e.g., 120" value={formData.duolingo.writing} onChange={(_, v) => handleSubfield('duolingo', 'writing', v)} />
//               <Field label="Speaking" field="duolingo.speaking" type="number" placeholder="e.g., 115" value={formData.duolingo.speaking} onChange={(_, v) => handleSubfield('duolingo', 'speaking', v)} />
//               <Field label="Listening" field="duolingo.listening" type="number" placeholder="e.g., 130" value={formData.duolingo.listening} onChange={(_, v) => handleSubfield('duolingo', 'listening', v)} />
//               {/* <Field label="Total" field="duolingo.total" placeholder="e.g., 120" value={formData.duolingo.total} onChange={(_, v) => handleSubfield('duolingo', 'total', v)} /> */}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// });
// const Step6EnglishTests = memo(({ formData, errors, handleInputChange, setErrors }) => {
//   const canEdit = formData.englishTest === 'Yes';

//   const handleTestChange = (field, value) => {
//     handleInputChange(field, value);
//     if (value === 'No') {
//       handleInputChange('toefl', { reading: '', writing: '', speaking: '', listening: '' });
//       handleInputChange('ielts', { reading: '', writing: '', speaking: '', listening: '' });
//       handleInputChange('duolingo', { reading: '', writing: '', speaking: '', listening: '' });
//       setErrors(prev => {
//         const newErrors = { ...prev };
//         delete newErrors.englishTest;
//         return newErrors;
//       });
//     }
//   };

//   const handleSubfield = (test, sub, val) => {
//     handleInputChange(test, { ...formData[test], [sub]: val });
//   };

//   return (
//     <div className="space-y-6">
//       <div className="text-center">
//         <h2 className="text-xl font-semibold text-gray-900 mb-2">English Proficiency Tests</h2>
//         <p className="text-gray-600 text-sm">TOEFL, IELTS, or Duolingo scores</p>
//       </div>

//       <div>
//         <Field
//           label="Q12. Do you have TOEFL / IELTS / Duolingo scores?"
//           field="englishTest"
//           type="radio"
//           options={['Yes', 'No']}
//           value={formData.englishTest}
//           onChange={handleTestChange}
//           hasError={!!errors.englishTest}
//         />
//         {errors.englishTest && (
//           <p className="text-red-500 text-sm mt-1 ml-1">{errors.englishTest}</p>
//         )}
//       </div>

//       {canEdit && (
//         <div className="space-y-6">
//           {/* TOEFL */}
//           <div className="border rounded-lg p-4 bg-gray-50">
//             <h3 className="font-medium mb-3">TOEFL</h3>
//             <div className="grid md:grid-cols-4 gap-3">
//               <Field label="Reading" field="toefl.reading" type="number" placeholder="e.g., 28" value={formData.toefl.reading} onChange={(_, v) => handleSubfield('toefl', 'reading', v)} />
//               <Field label="Writing" field="toefl.writing" type="number" placeholder="e.g., 26" value={formData.toefl.writing} onChange={(_, v) => handleSubfield('toefl', 'writing', v)} />
//               <Field label="Speaking" field="toefl.speaking" type="number" placeholder="e.g., 25" value={formData.toefl.speaking} onChange={(_, v) => handleSubfield('toefl', 'speaking', v)} />
//               <Field label="Listening" field="toefl.listening" type="number" placeholder="e.g., 27" value={formData.toefl.listening} onChange={(_, v) => handleSubfield('toefl', 'listening', v)} />
//             </div>
//           </div>

//           {/* IELTS */}
//           <div className="border rounded-lg p-4 bg-gray-50">
//             <h3 className="font-medium mb-3">IELTS</h3>
//             <div className="grid md:grid-cols-4 gap-3">
//               <Field label="Reading" field="ielts.reading" type="number" placeholder="e.g., 7.5" value={formData.ielts.reading} onChange={(_, v) => handleSubfield('ielts', 'reading', v)} />
//               <Field label="Writing" field="ielts.writing" type="number" placeholder="e.g., 7.0" value={formData.ielts.writing} onChange={(_, v) => handleSubfield('ielts', 'writing', v)} />
//               <Field label="Speaking" field="ielts.speaking" type="number" placeholder="e.g., 7.0" value={formData.ielts.speaking} onChange={(_, v) => handleSubfield('ielts', 'speaking', v)} />
//               <Field label="Listening" field="ielts.listening" type="number" placeholder="e.g., 8.0" value={formData.ielts.listening} onChange={(_, v) => handleSubfield('ielts', 'listening', v)} />
//             </div>
//           </div>

//           {/* Duolingo */}
//           <div className="border rounded-lg p-4 bg-gray-50">
//             <h3 className="font-medium mb-3">Duolingo</h3>
//             <div className="grid md:grid-cols-4 gap-3">
//               <Field label="Reading" field="duolingo.reading" type="number" placeholder="e.g., 125" value={formData.duolingo.reading} onChange={(_, v) => handleSubfield('duolingo', 'reading', v)} />
//               <Field label="Writing" field="duolingo.writing" type="number" placeholder="e.g., 120" value={formData.duolingo.writing} onChange={(_, v) => handleSubfield('duolingo', 'writing', v)} />
//               <Field label="Speaking" field="duolingo.speaking" type="number" placeholder="e.g., 115" value={formData.duolingo.speaking} onChange={(_, v) => handleSubfield('duolingo', 'speaking', v)} />
//               <Field label="Listening" field="duolingo.listening" type="number" placeholder="e.g., 130" value={formData.duolingo.listening} onChange={(_, v) => handleSubfield('duolingo', 'listening', v)} />
//               {/* <Field label="Total" field="duolingo.total" placeholder="e.g., 120" value={formData.duolingo.total} onChange={(_, v) => handleSubfield('duolingo', 'total', v)} /> */}
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// });


const Step7Final = memo(({ formData, errors, handleInputChange, isLastStep, dataValidation }) => {
  const isMaster = formData.degreeLevel === 'Master';

  return isMaster ? (
  <div className="space-y-2">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Standardized Test Scores & Experience</h2>
        <p className="text-gray-600 text-sm">GRE / GMAT and professional background</p>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Q12. GRE Quant" field="greQuant" type="number" placeholder="e.g., 165" value={formData.greQuant} onChange={handleInputChange} />
        <Field label="Q13.GRE Verbal" field="greVerbal" type="number" placeholder="e.g., 155" value={formData.greVerbal} onChange={handleInputChange} />
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Q14.GRE AWA" field="greAWA" type="number" placeholder="e.g., 4.0" value={formData.greAWA} onChange={handleInputChange} />
        <Field label="Q15.GMAT Total" field="gmatTotal" type="number" placeholder="e.g., 650" value={formData.gmatTotal} onChange={handleInputChange} />
      </div>
      {/* GMAT full width section */}
      <div className="grid grid-cols-1 gap-4">
        <Field label="Q16. GMAT Quant" field="gmatQuant" type="number" placeholder="e.g., 45" value={formData.gmatQuant} onChange={handleInputChange} />
      </div>
      {/* Work experience and industry in one line below */}
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Q17. Years of work experience" field="experienceYears" type="number" placeholder="e.g., 2" value={formData.experienceYears} onChange={handleInputChange} />
        <Field label="Q18. Work experience industry" field="experienceIndustry" type="text" placeholder="e.g., Tech" value={formData.experienceIndustry} onChange={handleInputChange} />
      </div>
      {isLastStep && <ReadyBox dataValidation={dataValidation} />}
    </div>
  ) : (
    <div className="space-y-2">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Career Goals & Timeline</h2>
        <p className="text-gray-600 text-sm">Share your aspirations</p>
      </div>
      <Field
        label="Q11. Mention your top extracurriculars or achievements (sports, leadership, clubs, etc.)"
        field="extracurriculars"
        type="textarea"
        required
        value={formData.extracurriculars}
        onChange={handleInputChange}
        hasError={!!errors.extracurriculars}
      />
      <Field
        label="Q12. Which intake are you targeting? (Example: Fall 2026)"
        field="intakeTarget"
        type="select"
        options={['Fall 2024', 'Spring 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026']}
        required
        value={formData.intakeTarget}
        onChange={handleInputChange}
        hasError={!!errors.intakeTarget}
      />
      {isLastStep && <ReadyBox dataValidation={dataValidation} />}
    </div>
  );
});
// const Step7Final = memo(({ formData, errors, handleInputChange, isLastStep, dataValidation }) => {
//   const isMaster = formData.degreeLevel === 'Master';

//   return isMaster ? (
//     <div className="space-y-2">
//       <div className="text-center">
//         <h2 className="text-xl font-semibold text-gray-900 mb-2">Standardized Test Scores</h2>
//         <p className="text-gray-600 text-sm">GRE / GMAT</p>
//       </div>
//       <div className="grid md:grid-cols-2 gap-4">
//         <Field label="GRE Total" field="greTotal" type="number" placeholder="e.g., 320" value={formData.greTotal} onChange={handleInputChange} />
//         <Field label="GRE Quant" field="greQuant" type="number" placeholder="e.g., 165" value={formData.greQuant} onChange={handleInputChange} />
//       </div>
//       <div className="grid md:grid-cols-2 gap-4">
//         <Field label="GRE Verbal" field="greVerbal" type="number" placeholder="e.g., 155" value={formData.greVerbal} onChange={handleInputChange} />
//         <Field label="GRE AWA" field="greAWA" type="number" placeholder="e.g., 4.0" value={formData.greAWA} onChange={handleInputChange} />
//       </div>
//       <div className="grid md:grid-cols-2 gap-4">
//         <Field label="GMAT Total" field="gmatTotal" type="number" placeholder="e.g., 650" value={formData.gmatTotal} onChange={handleInputChange} />
//         <Field label="GMAT Quant" field="gmatQuant" type="number" placeholder="e.g., 45" value={formData.gmatQuant} onChange={handleInputChange} />
//       </div>
//       {isLastStep && <ReadyBox dataValidation={dataValidation} />}
//     </div>
//   ) : (
//     <div className="space-y-2">
//       <div className="text-center">
//         <h2 className="text-xl font-semibold text-gray-900 mb-2">Career Goals & Timeline</h2>
//         <p className="text-gray-600 text-sm">Share your aspirations</p>
//       </div>
//       <Field
//         label="Q12. Mention your top extracurriculars or achievements (sports, leadership, clubs, etc.)"
//         field="extracurriculars"
//         type="textarea"
//         required
//         value={formData.extracurriculars}
//         onChange={handleInputChange}
//         hasError={!!errors.extracurriculars}
//       />
//       <Field
//         label="Q13. Which intake are you targeting? (Example: Fall 2026)"
//         field="intakeTarget"
//         type="select"
//         options={['Fall 2024', 'Spring 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026']}
//         required
//         value={formData.intakeTarget}
//         onChange={handleInputChange}
//         hasError={!!errors.intakeTarget}
//       />
//       {isLastStep && <ReadyBox dataValidation={dataValidation} />}
//     </div>
//   );
// });

const Step8 = memo(({ formData, errors, handleInputChange, dataValidation }) => {
  const isMaster = formData.degreeLevel === 'Master';
  const handleObject = (f, sub, v) => handleInputChange(f, { ...formData[f], [sub]: v });

  return (
    <div className="space-y-2">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Advanced Questions</h2>
        <p className="text-gray-600 text-sm">Detailed profile for better recommendations</p>
      </div>

      {isMaster && (
        <>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Preferred intake semester" field="intake" type="select" options={['Fall 2024', 'Spring 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026']} required value={formData.intake} onChange={handleInputChange} hasError={!!errors.intake} />
            <Field label="Program duration preference" field="duration" type="select" options={['1 year', '1.5 years', '2 years', 'No preference']} value={formData.duration} onChange={handleInputChange} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <Field label="Years of work experience" field="experienceYears" placeholder="e.g., 2" value={formData.experienceYears} onChange={handleInputChange} />
            <Field label="Industry" field="experienceIndustry" placeholder="e.g., Tech" value={formData.experienceIndustry} onChange={handleInputChange} />
          </div>
          <Field
            label="Leadership roles or promotions?"
            field="leadership.has"
            type="radio"
            options={['Yes', 'No']}
            value={formData.leadership?.has}
            onChange={(f, v) => handleObject('leadership', 'has', v)}
          />
          {formData.leadership?.has === 'Yes' && (
            <Field label="Details" field="leadership.details" type="textarea" value={formData.leadership?.details} onChange={(f, v) => handleObject('leadership', 'details', v)} />
          )}
          <Field label="Research projects" field="researchProjects" type="textarea" value={formData.researchProjects} onChange={handleInputChange} />
          <Field
            label="Certifications?"
            field="certifications.has"
            type="radio"
            options={['Yes', 'No']}
            value={formData.certifications?.has}
            onChange={(f, v) => handleObject('certifications', 'has', v)}
          />
          {formData.certifications?.has === 'Yes' && (
            <Field label="List" field="certifications.details" type="textarea" value={formData.certifications?.details} onChange={(f, v) => handleObject('certifications', 'details', v)} />
          )}
        </>
      )}

      {formData.degreeLevel === 'Bachelor' && (
        <>
          <div className="grid md:grid-cols-3 gap-4">
            <Field label="Q14. SAT EBRW" type="number" field="satBreakdown.ebrw" placeholder="700" value={formData.satBreakdown?.ebrw} onChange={(f, v) => handleObject('satBreakdown', 'ebrw', v)} />
            <Field label="Q15. SAT Math" type="number" field="satBreakdown.math" placeholder="750" value={formData.satBreakdown?.math} onChange={(f, v) => handleObject('satBreakdown', 'math', v)} />
            <Field label="Q16. SAT Total" field="satBreakdown.total" type="number" placeholder="1450" value={formData.satBreakdown?.total} onChange={(f, v) => handleObject('satBreakdown', 'total', v)} />
          </div>
          {/* <Field label="Test-optional?" field="testOptional" type="radio" options={['Yes', 'No']} value={formData.testOptional} onChange={handleInputChange} /> */}
          <Field label="Q17. Awards & achievements: Olympiads, hackathons, publications, or national-level recognition
" field="awards" type="textarea" value={formData.awards} onChange={handleInputChange} />
          <Field label="Q18. Any disciplinary issues or special family/health circumstances to note?
" field="specialCircumstances" type="textarea" value={formData.specialCircumstances} onChange={handleInputChange} />
        </>
      )}

      <ReadyBox dataValidation={dataValidation} />
    </div>
  );
});

export const QuestionnaireSteps = ({
  currentStep,
  formData,
  errors,
  handleInputChange,
  dataValidation,
  isLastStep,
  setErrors,
}) => {
  const isMaster = formData.degreeLevel === 'Master';
  // const isAdvanced = formData.intakeMode?.includes('Advanced');

  switch (currentStep) {
    case 1: return <Step1 key="s1" {...{ formData, errors, handleInputChange }} />;
    case 2: return <Step2 key="s2" {...{ formData, errors, handleInputChange }} />;
    // case 3: return <Step3 key="s3" {...{ formData, errors, handleInputChange }} />;
    case 3: return isMaster ? <Step4Master key="s4m" {...{ formData, errors, handleInputChange }} /> : <Step4Bachelor key="s4b" {...{ formData, errors, handleInputChange }} />;
    case 4: return isMaster ? <Step5Master key="s5m" {...{ formData, errors, handleInputChange }} /> : <Step5Bachelor key="s5b" {...{ formData, errors, handleInputChange }} />;
    case 5: return <Step6EnglishTests key="s6" {...{ formData, errors, handleInputChange, setErrors, isMaster }} />;
    case 6: return <Step7Final key="s7" {...{ formData, errors, handleInputChange, isLastStep, dataValidation }} />;
    case 7: return isAdvanced ? <Step8 key="s8" {...{ formData, errors, handleInputChange, dataValidation }} /> : null;
    default: return null;
  }
};