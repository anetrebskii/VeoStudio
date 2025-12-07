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
exports.generateVideo = exports.generateVideoFunction = void 0;
const https_1 = require("firebase-functions/v2/https");
const admin = __importStar(require("firebase-admin"));
const veoService_1 = require("./services/veoService");
const usageService_1 = require("./services/usageService");
admin.initializeApp();
exports.generateVideoFunction = (0, https_1.onCall)({
    timeoutSeconds: 540,
    memory: '1GiB',
}, async (request) => {
    const { auth, data } = request;
    if (!auth) {
        throw new https_1.HttpsError('unauthenticated', 'User must be authenticated');
    }
    const { generationId } = data;
    if (!generationId) {
        throw new https_1.HttpsError('invalid-argument', 'Generation ID is required');
    }
    const generationRef = admin
        .firestore()
        .collection('generations')
        .doc(generationId);
    try {
        const generationDoc = await generationRef.get();
        if (!generationDoc.exists) {
            throw new https_1.HttpsError('not-found', 'Generation not found');
        }
        const generation = generationDoc.data();
        if (generation.userId !== auth.uid) {
            throw new https_1.HttpsError('permission-denied', 'Not authorized to access this generation');
        }
        await generationRef.update({
            status: 'processing',
            updatedAt: admin.firestore.Timestamp.now(),
        });
        const result = await (0, veoService_1.generateVideo)(generation.request);
        const permanentVideoUrl = await (0, veoService_1.downloadAndUploadVideo)(result.videoUrl, admin.storage(), generation.userId, generationId);
        await generationRef.update({
            status: 'completed',
            videoUrl: permanentVideoUrl,
            actualCost: result.actualCost,
            completedAt: admin.firestore.Timestamp.now(),
            updatedAt: admin.firestore.Timestamp.now(),
        });
        await (0, usageService_1.updateUserUsage)(generation.userId, generation.request.model, result.actualCost);
        return {
            success: true,
            videoUrl: permanentVideoUrl,
            actualCost: result.actualCost,
        };
    }
    catch (error) {
        console.error('Error generating video:', error);
        await generationRef.update({
            status: 'failed',
            error: error.message || 'Failed to generate video',
            updatedAt: admin.firestore.Timestamp.now(),
        });
        throw new https_1.HttpsError('internal', error.message || 'Failed to generate video');
    }
});
exports.generateVideo = exports.generateVideoFunction;
//# sourceMappingURL=index.js.map