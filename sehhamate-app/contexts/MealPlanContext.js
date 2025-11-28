import React, { createContext, useState, useContext } from 'react';

const MealPlanContext = createContext();

export const useMealPlan = () => {
  const context = useContext(MealPlanContext);
  if (!context) {
    throw new Error('useMealPlan must be used within a MealPlanProvider');
  }
  return context;
};

export const MealPlanProvider = ({ children }) => {
  const [mealPlans, setMealPlans] = useState([]);

  const addMealPlan = (mealPlan) => {
    console.log('Adding meal plan to context:', mealPlan);
    setMealPlans(prev => [mealPlan, ...prev]);
  };

  const removeMealPlan = (mealPlanId) => {
    setMealPlans(prev => prev.filter(plan => plan.id !== mealPlanId));
  };

  const value = {
    mealPlans,
    addMealPlan,
    removeMealPlan
  };

  return (
    <MealPlanContext.Provider value={value}>
      {children}
    </MealPlanContext.Provider>
  );
};
