import { Router } from 'express';
import { GoogleGenAI } from '@google/genai';
import { getGoogleApiKey } from '../config';

const router = Router();

// AI Tech Advisor
router.post('/ai-advisor', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const apiKey = getGoogleApiKey();
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const systemInstruction = `You are NanoTech AI, an elite computer hardware advisor for NanoTech Marketplace & Hardware Studio in Nepal (Headquartered in Itahari-6 with Putalisadak branch Kathmandu).
Your job is to provide helpful, concise, friendly recommendations on computer accessories, PC builds, compatibility checks (GPUs, CPUs, RAM, SSDs, Motherboards), and pricing advice in Nepalese Rupees (NPR) or USD for new, used, and refurbished hardware. Keep answers under 150 words with bullet points when applicable.`;

        let responseText = '';
        const candidateModels = ['gemini-3.6-flash', 'gemini-3.8-flash'];
        for (const modelName of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                systemInstruction,
                temperature: 0.7,
              },
            });
            if (response.text) {
              responseText = response.text;
              break;
            }
          } catch (innerErr) {
            console.warn(`Gemini model ${modelName} call failed, trying next candidate:`, innerErr);
          }
        }

        if (responseText) {
          return res.json({ result: responseText, source: 'gemini-live' });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, using intelligent hardware advisor engine:', geminiErr);
      }
    }

    // Intelligent Local Hardware Intelligence Engine Fallback
    const q = prompt.toLowerCase();
    let advice = '';

    if (q.includes('rtx') || q.includes('gpu') || q.includes('graphics')) {
      advice = `**NanoTech Nepal GPU Intelligence:**
• **Recommended 1440p High FPS:** NVIDIA GeForce RTX 4070 Super 12GB (~NPR 98,500 – 108,000 in Kathmandu/Itahari market).
• **Best Budget 1080p Esports:** RTX 4060 8GB (~NPR 46,000) or Refurbished RTX 3060 12GB (~NPR 34,500).
• **Power & Space:** Requires minimum 650W PCIe 5.0 / Gold PSU and 310mm case clearance.
• **Warranty:** Authorized 3-Year official warranty with nationwide express courier delivery across all 7 provinces.`;
    } else if (q.includes('budget') || q.includes('price') || q.includes('npr') || q.includes('cheap')) {
      advice = `**NanoTech Nepal Budget Build Strategy:**
• **Sub-NPR 60,000 Rig:** AMD Ryzen 5 5600G APU, 16GB DDR4 3200MHz RAM, 512GB NVMe SSD, 550W PSU.
• **NPR 110,000 - 130,000 1080p Ultra:** Intel Core i5-13400F + RTX 4060 8GB, 16GB DDR5, 1TB Gen4 SSD, 650W Bronze PSU.
• **Refurbished Assurance:** Save 30-40% with verified 120-point diagnostic check and 1-Year NanoTech local replacement guarantee.`;
    } else if (q.includes('cpu') || q.includes('processor') || q.includes('intel') || q.includes('ryzen')) {
      advice = `**Processor Recommendation Guide (Nepal):**
• **Best Gaming Performance:** AMD Ryzen 7 7800X3D (AM5 socket, 3D V-Cache, unmatched FPS).
• **Best Productivity & Coding:** Intel Core i7-14700K (20-Core, DDR4/DDR5 flex).
• **Best Value All-Rounder:** AMD Ryzen 5 7600 with boxed Wraith cooler on B650 motherboard (~NPR 29,500).`;
    } else {
      advice = `**NanoTech Hardware Advisor Intelligence:**
• **Hardware Compatibility:** Every component ordered through NanoTech is verified for socket, TDP, PCIe lanes, and RAM clearance before dispatch.
• **Nepal Market Sourcing:** Genuine VAT invoices, official Nepal distributor warranty, and competitive pricing across Kathmandu, Pokhara, Itahari, and Biratnagar.
• **Assistance:** Feel free to ask about custom liquid cooling loops, 240Hz esports monitors, or specific motherboard chipsets!`;
    }

    return res.json({ result: advice, source: 'local-hardware-engine' });
  } catch (error: any) {
    console.error('AI Advisor error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate AI advice' });
  }
});

// Generate Seller Product Description
router.post('/generate-description', async (req, res) => {
  try {
    const { title, category, condition, brand, keySpecs } = req.body;
    const apiKey = getGoogleApiKey();

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `Write a compelling, professional, e-commerce product description for a computer accessory/part on NanoTech Marketplace.
Product Title: ${title}
Category: ${category}
Condition: ${condition}
Brand: ${brand}
Key Specs: ${keySpecs || 'High performance computer hardware'}

Structure:
1. Catchy single-paragraph summary highlighting performance & condition.
2. 3-4 bullet points of standout technical features.
3. Friendly reassurance regarding warranty and fast shipping. Keep it under 180 words total.`;

        let descriptionText = '';
        const candidateModels = ['gemini-3.6-flash', 'gemini-3.8-flash'];
        for (const modelName of candidateModels) {
          try {
            const response = await ai.models.generateContent({
              model: modelName,
              contents: prompt,
              config: {
                temperature: 0.7,
              },
            });
            if (response.text) {
              descriptionText = response.text;
              break;
            }
          } catch (innerErr) {
            console.warn(`Gemini model ${modelName} call failed for description, trying next candidate:`, innerErr);
          }
        }

        if (descriptionText) {
          return res.json({ description: descriptionText, source: 'gemini-live' });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, using intelligent product copy engine:', geminiErr);
      }
    }

    // Intelligent Local Product Copywriter Fallback
    const desc = `The ${title} delivers uncompromising performance and precision engineering for enthusiasts and creators. Carefully curated by NanoTech, this ${condition || 'Genuine'} ${brand || 'top-tier'} component provides rock-solid stability and thermal efficiency for demanding gaming and professional workloads.

• **Premium Architecture:** Engineered with high-grade components for optimal power delivery and sustained clock frequencies.
• **Rigorous Diagnostic:** Backed by our multi-point hardware validation ensuring peak silicon health and thermal performance.
• **Technical Highlights:** ${keySpecs || 'High-speed throughput, optimized heat dissipation, and universal chassis compatibility'}.
• **Official Nepal Warranty:** Covered by NanoTech Express Replacement guarantee with rapid shipping across Nepal.`;

    return res.json({ description: desc, source: 'local-copy-engine' });
  } catch (error: any) {
    console.error('Generate Description error:', error);
    return res.status(500).json({ error: error?.message || 'Failed to generate product description' });
  }
});

export default router;
