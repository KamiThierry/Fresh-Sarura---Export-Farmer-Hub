import mongoose from 'mongoose';
import CropCycle from '../backend/models/CropCycle.js';
import BudgetRequest from '../backend/models/BudgetRequest.js';
import { approveBudgetRequest } from '../backend/controllers/CropCycle.js';
import { submitFieldReport } from '../backend/controllers/farmManagerController.js';

// This is a scratch script for verification of the new accounting logic.
// Logic: 
// 1. Approve a request -> cycle.approved should increase, cycle.spent should stay same.
// 2. Submit a report -> cycle.spent should increase, category.spent should increase.

const runTest = async () => {
    try {
        console.log("Starting Accounting Logic Verification...");
        
        // Mock data
        const cycle = new CropCycle({
            farm_name: "Test Farm",
            crop_name: "Test Crop",
            total_budget: 100000,
            budget_categories: [
                { name: "Labor", allocated: 50000, approved: 0, spent: 0 },
                { name: "Seeds", allocated: 50000, approved: 0, spent: 0 }
            ]
        });
        
        console.log("Initial state:", JSON.stringify(cycle.budget_categories, null, 2));

        // Simulate PM Approval
        const sumForCat = 20000;
        const updatedCategories = cycle.budget_categories.map(cat => {
            if (cat.name === "Labor") {
                return { ...cat.toObject(), approved: (cat.approved || 0) + sumForCat };
            }
            return cat;
        });
        cycle.budget_categories = updatedCategories;
        cycle.approved = (cycle.approved || 0) + sumForCat;

        console.log("After Approval (20k Labor):", JSON.stringify({
            categories: cycle.budget_categories,
            global_approved: cycle.approved,
            global_spent: cycle.spent
        }, null, 2));

        if (cycle.spent !== 0) throw new Error("FAIL: Spent should be 0 after approval.");
        if (cycle.approved !== 20000) throw new Error("FAIL: Global approved should be 20000.");

        // Simulate FM Report
        const actualCost = 22000;
        const categoryName = "Labor";
        
        // Find and update
        const catIdx = cycle.budget_categories.findIndex(c => c.name === categoryName);
        cycle.budget_categories[catIdx].spent += actualCost;
        cycle.spent += actualCost;

        console.log("After Field Report (22k Labor Actual):", JSON.stringify({
            categories: cycle.budget_categories,
            global_approved: cycle.approved,
            global_spent: cycle.spent
        }, null, 2));

        if (cycle.spent !== 22000) throw new Error("FAIL: Global spent should be 22000.");
        if (cycle.budget_categories[catIdx].spent !== 22000) throw new Error("FAIL: Category spent should be 22000.");

        console.log("SUCCESS: Accounting logic verified.");
    } catch (err) {
        console.error("TEST FAILED:", err.message);
    }
};

runTest();
