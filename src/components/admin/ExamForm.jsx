import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { supabase } from '../../supabase/config';
import { useAuth } from '../../contexts/AuthContext';

export default function ExamForm({ onSuccess, examToEdit = null }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const defaultValues = examToEdit ? {
    title: examToEdit.title,
    description: examToEdit.description || '',
    duration: examToEdit.duration,
    questions: examToEdit.questions || [{ 
      questionText: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0 
    }]
  } : {
    title: '',
    description: '',
    duration: 60,
    questions: [{ 
      questionText: '', 
      options: ['', '', '', ''], 
      correctAnswer: 0 
    }]
  };
  
  const { register, control, handleSubmit, formState: { errors } } = useForm({
    defaultValues
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "questions"
  });
  
  const onSubmit = async (data) => {
    if (!currentUser) {
      setError('You must be logged in to create an exam');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Validate questions
      const validQuestions = data.questions.filter(q => 
        q.questionText.trim() !== '' && 
        q.options.filter(opt => opt.trim() !== '').length >= 2
      );
      
      if (validQuestions.length === 0) {
        throw new Error('At least one valid question with 2+ options is required');
      }
      
      const examData = {
        title: data.title,
        description: data.description,
        duration: parseInt(data.duration),
        questions: validQuestions,
        created_by: currentUser.id
      };
      
      let result;
      
      if (examToEdit) {
        // Update existing exam
        result = await supabase
          .from('exams')
          .update(examData)
          .eq('id', examToEdit.id);
      } else {
        // Create new exam
        result = await supabase
          .from('exams')
          .insert(examData);
      }
      
      if (result.error) throw result.error;
      
      onSuccess(result.data);
    } catch (err) {
      console.error('Error saving exam:', err);
      setError(err.message || 'Failed to save exam');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-6">
        {examToEdit ? 'Edit Exam' : 'Create New Exam'}
      </h2>
      
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-6">
          {/* Exam Details */}
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Exam Title*
            </label>
            <input
              type="text"
              {...register("title", { required: "Title is required" })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.title && (
              <p className="text-red-600 text-sm mt-1">{errors.title.message}</p>
            )}
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              {...register("description")}
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Duration (minutes)*
            </label>
            <input
              type="number"
              min="1"
              {...register("duration", { 
                required: "Duration is required",
                min: { value: 1, message: "Duration must be at least 1 minute" }
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.duration && (
              <p className="text-red-600 text-sm mt-1">{errors.duration.message}</p>
            )}
          </div>
          
          {/* Questions */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Questions</h3>
              <button
                type="button"
                onClick={() => append({ 
                  questionText: '', 
                  options: ['', '', '', ''], 
                  correctAnswer: 0 
                })}
                className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
              >
                Add Question
              </button>
            </div>
            
            {fields.map((field, index) => (
              <div key={field.id} className="bg-gray-50 p-4 rounded-md mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium">Question {index + 1}</h4>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
                
                <div className="mb-3">
                  <label className="block text-gray-700 font-medium mb-2">
                    Question Text*
                  </label>
                  <input
                    type="text"
                    {...register(`questions.${index}.questionText`, { 
                      required: "Question text is required" 
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.questions?.[index]?.questionText && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.questions[index].questionText.message}
                    </p>
                  )}
                </div>
                
                <div className="mb-3">
                  <label className="block text-gray-700 font-medium mb-2">
                    Options*
                  </label>
                  <div className="space-y-2">
                    {[0, 1, 2, 3].map((optionIndex) => (
                      <div key={optionIndex} className="flex items-center">
                        <input
                          type="radio"
                          id={`correct-${index}-${optionIndex}`}
                          {...register(`questions.${index}.correctAnswer`)}
                          value={optionIndex}
                          className="mr-2"
                        />
                        <input
                          type="text"
                          {...register(`questions.${index}.options.${optionIndex}`, {
                            required: optionIndex < 2 ? "At least 2 options are required" : false
                          })}
                          placeholder={`Option ${optionIndex + 1}${optionIndex < 2 ? '*' : ''}`}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    ))}
                  </div>
                  {errors.questions?.[index]?.options && (
                    <p className="text-red-600 text-sm mt-1">
                      {errors.questions[index].options.message}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : examToEdit ? 'Update Exam' : 'Create Exam'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
