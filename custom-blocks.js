/**
 * DragonCMS Custom Blocks Configuration
 * 
 * This file allows you to add custom blocks to the DragonCMS editor.
 * Blocks are containers that can hold other content and typically have layout capabilities.
 * 
 * Usage:
 * 1. Add block definitions to the customBlocks array below
 * 2. The blocks will automatically appear in the editor's block panel
 * 3. Users can drag these blocks into the editor canvas
 * 
 * Block Configuration Properties:
 * - id: Unique identifier for the block
 * - name: Display name in the editor panel
 * - type: Must be 'block' for container elements
 * - preview: 'text' or 'image' - how to display the preview
 * - previewImage: (optional) SVG data URL for image preview
 * - html: The HTML structure of the block
 * - description: (optional) Tooltip description
 * - category: (optional) Category for organization
 */

// Define custom blocks
window.DragonBlocks = {
    // Custom blocks defined by the user
    customBlocks: [
        {
            id: 'custom-card-block',
            name: 'Card Block',
            type: 'block',
            preview: 'text',
            description: 'A card-style container with shadow and padding',
            category: 'layout',
            html: `
                <div class="editor-block card-block" style="
                    background: white;
                    border-radius: 12px;
                    padding: 30px;
                    margin: 20px 0;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    border: 1px solid #e5e7eb;
                ">
                    <div class="card-content">
                        <h3 style="margin: 0 0 15px 0; color: #1f2937;">Card Title</h3>
                        <p style="margin: 0; color: #6b7280; line-height: 1.6;">
                            This is a custom card block. Add your content here.
                        </p>
                    </div>
                </div>
            `
        },
        {
            id: 'custom-feature-grid',
            name: 'Feature Grid',
            type: 'block',
            preview: 'text',
            description: 'A 2x2 grid layout for showcasing features',
            category: 'layout',
            html: `
                <div class="editor-block feature-grid-block" style="
                    padding: 40px 20px;
                    background: #f9fafb;
                ">
                    <div class="feature-grid" style="
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 30px;
                        max-width: 1200px;
                        margin: 0 auto;
                    ">
                        <div class="feature-item" style="
                            background: white;
                            padding: 25px;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">
                            <h4 style="margin: 0 0 10px 0; color: #1f2937;">Feature 1</h4>
                            <p style="margin: 0; color: #6b7280;">Description of feature 1</p>
                        </div>
                        <div class="feature-item" style="
                            background: white;
                            padding: 25px;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">
                            <h4 style="margin: 0 0 10px 0; color: #1f2937;">Feature 2</h4>
                            <p style="margin: 0; color: #6b7280;">Description of feature 2</p>
                        </div>
                        <div class="feature-item" style="
                            background: white;
                            padding: 25px;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">
                            <h4 style="margin: 0 0 10px 0; color: #1f2937;">Feature 3</h4>
                            <p style="margin: 0; color: #6b7280;">Description of feature 3</p>
                        </div>
                        <div class="feature-item" style="
                            background: white;
                            padding: 25px;
                            border-radius: 8px;
                            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                        ">
                            <h4 style="margin: 0 0 10px 0; color: #1f2937;">Feature 4</h4>
                            <p style="margin: 0; color: #6b7280;">Description of feature 4</p>
                        </div>
                    </div>
                </div>
            `
        },
        {
            id: 'custom-cta-section',
            name: 'Call to Action',
            type: 'block',
            preview: 'text',
            description: 'Centered call-to-action section with gradient background',
            category: 'marketing',
            html: `
                <div class="editor-block cta-block" style="
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 60px 40px;
                    text-align: center;
                    color: white;
                    margin: 40px 0;
                ">
                    <div class="cta-content" style="max-width: 600px; margin: 0 auto;">
                        <h2 style="
                            font-size: 36px;
                            font-weight: bold;
                            margin: 0 0 20px 0;
                            line-height: 1.2;
                        ">Ready to Get Started?</h2>
                        <p style="
                            font-size: 18px;
                            margin: 0 0 30px 0;
                            opacity: 0.9;
                            line-height: 1.6;
                        ">Join thousands of users who are already using our platform to build amazing things.</p>
                        <button style="
                            background: white;
                            color: #667eea;
                            border: none;
                            padding: 15px 40px;
                            font-size: 18px;
                            font-weight: 600;
                            border-radius: 50px;
                            cursor: pointer;
                            transition: transform 0.2s ease;
                        " onmouseover="this.style.transform='scale(1.05)'" onmouseout="this.style.transform='scale(1)'">
                            Get Started Today
                        </button>
                    </div>
                </div>
            `
        },
        {
            id: 'custom-testimonial-block',
            name: 'Testimonial Section',
            type: 'block',
            preview: 'text',
            description: 'Testimonial section with customer quotes',
            category: 'content',
            html: `
                <div class="editor-block testimonial-block" style="
                    padding: 60px 40px;
                    background: #ffffff;
                    border-top: 1px solid #e5e7eb;
                    border-bottom: 1px solid #e5e7eb;
                ">
                    <div style="max-width: 800px; margin: 0 auto; text-align: center;">
                        <h2 style="
                            font-size: 32px;
                            margin: 0 0 50px 0;
                            color: #1f2937;
                        ">What Our Customers Say</h2>
                        <div style="
                            display: flex;
                            gap: 40px;
                            justify-content: center;
                            flex-wrap: wrap;
                        ">
                            <div class="testimonial" style="
                                flex: 1;
                                min-width: 300px;
                                max-width: 350px;
                                background: #f9fafb;
                                padding: 30px;
                                border-radius: 12px;
                                position: relative;
                            ">
                                <div style="
                                    font-size: 48px;
                                    color: #d1d5db;
                                    line-height: 1;
                                    margin-bottom: 20px;
                                ">"</div>
                                <p style="
                                    font-style: italic;
                                    margin: 0 0 20px 0;
                                    color: #374151;
                                    line-height: 1.6;
                                ">This product has completely transformed how we work. Highly recommended!</p>
                                <div style="
                                    display: flex;
                                    align-items: center;
                                    gap: 15px;
                                ">
                                    <div style="
                                        width: 50px;
                                        height: 50px;
                                        background: linear-gradient(45deg, #667eea, #764ba2);
                                        border-radius: 50%;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        color: white;
                                        font-weight: bold;
                                    ">JS</div>
                                    <div>
                                        <div style="font-weight: 600; color: #1f2937;">John Smith</div>
                                        <div style="color: #6b7280; font-size: 14px;">CEO, TechCorp</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `
        },
        {
            id: 'custom-pricing-block',
            name: 'Pricing Table',
            type: 'block',
            preview: 'text',
            description: 'Three-column pricing comparison table',
            category: 'marketing',
            html: `
                <div class="editor-block pricing-block" style="
                    padding: 60px 40px;
                    background: #f9fafb;
                ">
                    <div style="max-width: 1000px; margin: 0 auto; text-align: center;">
                        <h2 style="
                            font-size: 36px;
                            margin: 0 0 20px 0;
                            color: #1f2937;
                        ">Choose Your Plan</h2>
                        <p style="
                            font-size: 18px;
                            color: #6b7280;
                            margin: 0 0 50px 0;
                        ">Select the perfect plan for your needs</p>
                        <div style="
                            display: grid;
                            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
                            gap: 30px;
                            margin-top: 40px;
                        ">
                            <div class="pricing-card" style="
                                background: white;
                                border-radius: 12px;
                                padding: 40px 30px;
                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                position: relative;
                            ">
                                <h3 style="
                                    font-size: 24px;
                                    margin: 0 0 10px 0;
                                    color: #1f2937;
                                ">Basic</h3>
                                <div style="
                                    font-size: 48px;
                                    font-weight: bold;
                                    color: #667eea;
                                    margin: 20px 0;
                                ">$9<span style="font-size: 18px; color: #6b7280;">/mo</span></div>
                                <ul style="
                                    list-style: none;
                                    padding: 0;
                                    margin: 30px 0;
                                    text-align: left;
                                ">
                                    <li style="padding: 8px 0; color: #374151;">✓ 5 Projects</li>
                                    <li style="padding: 8px 0; color: #374151;">✓ Basic Support</li>
                                    <li style="padding: 8px 0; color: #374151;">✓ 1GB Storage</li>
                                </ul>
                                <button style="
                                    width: 100%;
                                    background: #667eea;
                                    color: white;
                                    border: none;
                                    padding: 15px;
                                    border-radius: 8px;
                                    font-size: 16px;
                                    font-weight: 600;
                                    cursor: pointer;
                                ">Get Started</button>
                            </div>
                            <div class="pricing-card featured" style="
                                background: white;
                                border-radius: 12px;
                                padding: 40px 30px;
                                box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
                                position: relative;
                                border: 2px solid #667eea;
                                transform: scale(1.05);
                            ">
                                <div style="
                                    position: absolute;
                                    top: -12px;
                                    left: 50%;
                                    transform: translateX(-50%);
                                    background: #667eea;
                                    color: white;
                                    padding: 6px 20px;
                                    border-radius: 20px;
                                    font-size: 12px;
                                    font-weight: 600;
                                ">POPULAR</div>
                                <h3 style="
                                    font-size: 24px;
                                    margin: 0 0 10px 0;
                                    color: #1f2937;
                                ">Pro</h3>
                                <div style="
                                    font-size: 48px;
                                    font-weight: bold;
                                    color: #667eea;
                                    margin: 20px 0;
                                ">$29<span style="font-size: 18px; color: #6b7280;">/mo</span></div>
                                <ul style="
                                    list-style: none;
                                    padding: 0;
                                    margin: 30px 0;
                                    text-align: left;
                                ">
                                    <li style="padding: 8px 0; color: #374151;">✓ Unlimited Projects</li>
                                    <li style="padding: 8px 0; color: #374151;">✓ Priority Support</li>
                                    <li style="padding: 8px 0; color: #374151;">✓ 50GB Storage</li>
                                    <li style="padding: 8px 0; color: #374151;">✓ Advanced Features</li>
                                </ul>
                                <button style="
                                    width: 100%;
                                    background: #667eea;
                                    color: white;
                                    border: none;
                                    padding: 15px;
                                    border-radius: 8px;
                                    font-size: 16px;
                                    font-weight: 600;
                                    cursor: pointer;
                                ">Get Started</button>
                            </div>
                            <div class="pricing-card" style="
                                background: white;
                                border-radius: 12px;
                                padding: 40px 30px;
                                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                                position: relative;
                            ">
                                <h3 style="
                                    font-size: 24px;
                                    margin: 0 0 10px 0;
                                    color: #1f2937;
                                ">Enterprise</h3>
                                <div style="
                                    font-size: 48px;
                                    font-weight: bold;
                                    color: #667eea;
                                    margin: 20px 0;
                                ">$99<span style="font-size: 18px; color: #6b7280;">/mo</span></div>
                                <ul style="
                                    list-style: none;
                                    padding: 0;
                                    margin: 30px 0;
                                    text-align: left;
                                ">
                                    <li style="padding: 8px 0; color: #374151;">✓ Everything in Pro</li>
                                    <li style="padding: 8px 0; color: #374151;">✓ 24/7 Support</li>
                                    <li style="padding: 8px 0; color: #374151;">✓ Unlimited Storage</li>
                                    <li style="padding: 8px 0; color: #374151;">✓ Custom Integrations</li>
                                </ul>
                                <button style="
                                    width: 100%;
                                    background: #667eea;
                                    color: white;
                                    border: none;
                                    padding: 15px;
                                    border-radius: 8px;
                                    font-size: 16px;
                                    font-weight: 600;
                                    cursor: pointer;
                                ">Contact Sales</button>
                            </div>
                        </div>
                    </div>
                </div>
            `
        }
    ],

    // Get all custom blocks
    getAllCustomBlocks() {
        return this.customBlocks;
    },

    // Get blocks by category
    getBlocksByCategory(category) {
        return this.customBlocks.filter(block => block.category === category);
    },

    // Add a new custom block programmatically
    addCustomBlock(block) {
        // Validate required properties
        if (!block.id || !block.name || !block.html) {
            console.warn('Custom block must have id, name, and html properties');
            return false;
        }

        // Ensure type is 'block'
        block.type = 'block';

        // Check for duplicate IDs
        if (this.customBlocks.some(existingBlock => existingBlock.id === block.id)) {
            console.warn(`Block with ID '${block.id}' already exists`);
            return false;
        }

        this.customBlocks.push(block);
        return true;
    },

    // Get block by ID
    getBlockById(id) {
        return this.customBlocks.find(block => block.id === id);
    },

    // Get all available categories
    getCategories() {
        const categories = [...new Set(this.customBlocks.map(block => block.category).filter(Boolean))];
        return categories.sort();
    }
};