"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserUsage = updateUserUsage;
const admin = __importStar(require("firebase-admin"));
async function updateUserUsage(userId, model, cost) {
    const usageRef = admin.firestore().collection('usage').doc(userId);
    await admin.firestore().runTransaction(async (transaction) => {
        const usageDoc = await transaction.get(usageRef);
        if (!usageDoc.exists) {
            const newUsage = {
                userId,
                totalGenerations: 1,
                totalSpent: cost,
                generationsByModel: {
                    'veo-3.0-generate-001': model === 'veo-3.0-generate-001' ? 1 : 0,
                    'veo-3.0-fast-generate-001': model === 'veo-3.0-fast-generate-001' ? 1 : 0,
                    'veo-3.1-generate-preview': model === 'veo-3.1-generate-preview' ? 1 : 0,
                    'veo-3.1-fast-generate-preview': model === 'veo-3.1-fast-generate-preview' ? 1 : 0,
                },
                spentByModel: {
                    'veo-3.0-generate-001': model === 'veo-3.0-generate-001' ? cost : 0,
                    'veo-3.0-fast-generate-001': model === 'veo-3.0-fast-generate-001' ? cost : 0,
                    'veo-3.1-generate-preview': model === 'veo-3.1-generate-preview' ? cost : 0,
                    'veo-3.1-fast-generate-preview': model === 'veo-3.1-fast-generate-preview' ? cost : 0,
                },
                lastGenerationAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now(),
            };
            transaction.set(usageRef, newUsage);
        }
        else {
            transaction.update(usageRef, {
                totalGenerations: admin.firestore.FieldValue.increment(1),
                totalSpent: admin.firestore.FieldValue.increment(cost),
                [`generationsByModel.${model}`]: admin.firestore.FieldValue.increment(1),
                [`spentByModel.${model}`]: admin.firestore.FieldValue.increment(cost),
                lastGenerationAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now(),
            });
        }
    });
}
//# sourceMappingURL=usageService.js.map