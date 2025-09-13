// Snippet definitions for the drag-and-drop editor
// Each snippet can have either a text label or an image preview
//
// SUPPORTED PREVIEW IMAGE FORMATS:
// - SVG (inline or data URL)
// - PNG (file path or data URL) 
// - JPEG/JPG (file path or data URL)
// - WebP (file path or data URL)
// - GIF (file path or data URL)
// - Any web-compatible image format
//
// PREVIEW IMAGE OPTIONS:
// 1. File path: './images/my-preview.png'
// 2. Absolute URL: 'https://example.com/preview.jpg'
// 3. Data URL: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'
// 4. SVG data URL: svgToDataUrl('<svg>...</svg>')
//
// EXAMPLE USAGE:
// {
//     id: 'my-snippet',
//     name: 'My Custom Snippet',
//     type: 'snippet',
//     preview: 'image',
//     previewImage: './assets/my-preview.png',  // Any image format! (Note: assets path can be configured)
//     html: '<div>My content</div>'
// }

// Helper function to safely encode SVG to base64
function svgToDataUrl(svgString) {
    // Clean the SVG string to ensure it's properly encoded
    const cleanSvg = svgString.trim().replace(/\s+/g, ' ');
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cleanSvg);
}

const SNIPPET_LIBRARY = {
    sections: [
        {
            id: 'empty-section',
            name: 'Empty Section',
            type: 'section',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="100" fill="#ffffff" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="5,5"/>
                    <text x="100" y="50" text-anchor="middle" fill="#a0aec0" font-size="12">Empty Section</text>
                    <text x="100" y="70" text-anchor="middle" fill="#cbd5e0" font-size="10">Drag blocks here</text>
                </svg>
            `),
            html: '<section class="editor-section empty-section" style="width: 100%; padding: 60px 0; background: #ffffff; min-height: 200px; border: 2px dashed #e2e8f0;"><div class="section-content" style="max-width: 1200px; margin: 0 auto; padding: 0 20px; min-height: 100px; display: flex; align-items: center; justify-content: center; color: #a0aec0;"><p style="text-align: center; margin: 0;">Drag blocks and content here to build your section</p></div></section>'
        },
        {
            id: 'hero-section',
            name: 'Hero Section',
            type: 'section',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="100" fill="#f0f4f8"/>
                    <rect width="200" height="40" fill="#4a5568"/>
                    <text x="100" y="25" text-anchor="middle" fill="white" font-size="14" font-weight="bold">Hero Section</text>
                    <rect x="20" y="55" width="160" height="30" fill="#e2e8f0" rx="4"/>
                </svg>
            `),
            html: `<section class="editor-section hero-section" style="width: 100%; padding: 80px 0; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div class="section-content" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
                    <div class="editor-block" style="position: relative; text-align: center; color: white;">
                        <div class="column" style="flex: 1;">
                            <h1 contenteditable="true" style="outline: none; font-size: 3.5rem; font-weight: bold; margin-bottom: 1rem; line-height: 1.2;">Transform Your Business Today</h1>
                            <p contenteditable="true" style="outline: none; font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; max-width: 600px; margin-left: auto; margin-right: auto;">Discover powerful solutions that help you grow, scale, and succeed in today's competitive market.</p>
                            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
                                <button contenteditable="true" style="outline: none; background: #ffffff; color: #667eea; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; font-size: 1.1rem;">Get Started Free</button>
                                <button contenteditable="true" style="outline: none; background: transparent; color: white; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 600; border: 2px solid rgba(255,255,255,0.3); cursor: pointer; font-size: 1.1rem;">Watch Demo</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>`
        },
        {
            id: 'content-section',
            name: 'Content Section',
            type: 'section',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="100" fill="#ffffff" stroke="#e2e8f0"/>
                    <text x="100" y="20" text-anchor="middle" fill="#2d3748" font-size="12">Content Section</text>
                    <rect x="20" y="30" width="160" height="20" fill="#e2e8f0" rx="2"/>
                    <rect x="20" y="55" width="160" height="20" fill="#e2e8f0" rx="2"/>
                </svg>
            `),
            html: `<section class="editor-section content-section" style="width: 100%; padding: 60px 0; background: #ffffff;">
                <div class="section-content" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
                    <div class="editor-block" style="position: relative;">
                        <div class="two-column-container" style="display: flex; gap: 40px; align-items: center;">
                            <div class="column" style="flex: 1;">
                                <h2 contenteditable="true" style="outline: none; font-size: 2.5rem; font-weight: bold; margin-bottom: 1.5rem; color: #2d3748;">Why Choose Us?</h2>
                                <p contenteditable="true" style="outline: none; font-size: 1.125rem; line-height: 1.7; color: #4a5568; margin-bottom: 1.5rem;">We provide innovative solutions that help businesses thrive in today's digital landscape. Our team of experts is dedicated to delivering results that exceed expectations.</p>
                                <ul style="list-style: none; padding: 0;">
                                    <li contenteditable="true" style="outline: none; display: flex; align-items: center; margin-bottom: 1rem; color: #2d3748;"><span style="background: #48bb78; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 1rem; font-size: 14px;">✓</span>Expert team with 10+ years experience</li>
                                    <li contenteditable="true" style="outline: none; display: flex; align-items: center; margin-bottom: 1rem; color: #2d3748;"><span style="background: #48bb78; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 1rem; font-size: 14px;">✓</span>24/7 customer support</li>
                                    <li contenteditable="true" style="outline: none; display: flex; align-items: center; margin-bottom: 1rem; color: #2d3748;"><span style="background: #48bb78; color: white; width: 24px; height: 24px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-right: 1rem; font-size: 14px;">✓</span>Money-back guarantee</li>
                                </ul>
                            </div>
                            <div class="column" style="flex: 1;">
                                <img src="assets/images/vase.jpg" alt="Content Image" style="width: 100%; height: auto; border-radius: 0.5rem; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                            </div>
                        </div>
                    </div>
                </div>
            </section>`
        },
        {
            id: 'features-section',
            name: 'Features Section',
            type: 'section',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="100" fill="#f7fafc"/>
                    <text x="100" y="20" text-anchor="middle" fill="#2d3748" font-size="12">Features</text>
                    <rect x="20" y="30" width="50" height="50" fill="#e2e8f0" rx="4"/>
                    <rect x="75" y="30" width="50" height="50" fill="#e2e8f0" rx="4"/>
                    <rect x="130" y="30" width="50" height="50" fill="#e2e8f0" rx="4"/>
                </svg>
            `),
            html: `<section class="editor-section features-section" style="width: 100%; padding: 80px 0; background: #f7fafc;">
                <div class="section-content" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
                    <div class="editor-block" style="position: relative; text-align: center; margin-bottom: 3rem;">
                        <div class="column" style="flex: 1;">
                            <h2 contenteditable="true" style="outline: none; font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem; color: #2d3748;">Our Features</h2>
                            <p contenteditable="true" style="outline: none; font-size: 1.25rem; color: #4a5568; max-width: 600px; margin: 0 auto;">Everything you need to succeed, all in one powerful platform</p>
                        </div>
                    </div>
                    <div class="editor-block" style="position: relative;">
                        <div class="three-column-container" style="display: flex; gap: 30px;">
                            <div class="column" style="flex: 1; text-align: center; padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                                <div style="width: 60px; height: 60px; background: #4299e1; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 24px;">🚀</div>
                                <h3 contenteditable="true" style="outline: none; font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #2d3748;">Fast Performance</h3>
                                <p contenteditable="true" style="outline: none; color: #4a5568; line-height: 1.6;">Lightning-fast loading times and optimized performance for the best user experience.</p>
                            </div>
                            <div class="column" style="flex: 1; text-align: center; padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                                <div style="width: 60px; height: 60px; background: #48bb78; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 24px;">🔒</div>
                                <h3 contenteditable="true" style="outline: none; font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #2d3748;">Secure & Reliable</h3>
                                <p contenteditable="true" style="outline: none; color: #4a5568; line-height: 1.6;">Enterprise-grade security with 99.9% uptime guarantee to keep your business running smoothly.</p>
                            </div>
                            <div class="column" style="flex: 1; text-align: center; padding: 2rem; background: white; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                                <div style="width: 60px; height: 60px; background: #ed8936; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; font-size: 24px;">⚡</div>
                                <h3 contenteditable="true" style="outline: none; font-size: 1.5rem; font-weight: 600; margin-bottom: 1rem; color: #2d3748;">Easy to Use</h3>
                                <p contenteditable="true" style="outline: none; color: #4a5568; line-height: 1.6;">Intuitive interface that requires no technical expertise. Get started in minutes, not hours.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>`
        },
        {
            id: 'cta-section',
            name: 'Call to Action Section',
            type: 'section',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="100" fill="#2d3748"/>
                    <text x="100" y="40" text-anchor="middle" fill="white" font-size="14">CTA Section</text>
                    <rect x="60" y="55" width="80" height="25" fill="#4299e1" rx="4"/>
                    <text x="100" y="72" text-anchor="middle" fill="white" font-size="10">Get Started</text>
                </svg>
            `),
            html: `<section class="editor-section cta-section" style="width: 100%; padding: 60px 0; background: #2d3748;">
                <div class="section-content" style="max-width: 1200px; margin: 0 auto; padding: 0 20px; text-align: center;">
                    <div class="editor-block" style="position: relative; color: white;">
                        <div class="column" style="flex: 1;">
                            <h2 contenteditable="true" style="outline: none; font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">Ready to Get Started?</h2>
                            <p contenteditable="true" style="outline: none; font-size: 1.25rem; margin-bottom: 2rem; opacity: 0.9; max-width: 600px; margin-left: auto; margin-right: auto;">Join thousands of satisfied customers who have transformed their business with our platform.</p>
                            <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap; margin-bottom: 2rem;">
                                <button contenteditable="true" style="outline: none; background: #4299e1; color: white; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 600; border: none; cursor: pointer; font-size: 1.1rem;">Start Free Trial</button>
                                <button contenteditable="true" style="outline: none; background: transparent; color: white; padding: 1rem 2rem; border-radius: 0.5rem; font-weight: 600; border: 2px solid rgba(255,255,255,0.3); cursor: pointer; font-size: 1.1rem;">Schedule Demo</button>
                            </div>
                            <div style="display: flex; align-items: center; justify-content: center; gap: 2rem; opacity: 0.8; flex-wrap: wrap;">
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="color: #48bb78;">✓</span>
                                    <span contenteditable="true" style="outline: none;">No credit card required</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="color: #48bb78;">✓</span>
                                    <span contenteditable="true" style="outline: none;">14-day free trial</span>
                                </div>
                                <div style="display: flex; align-items: center; gap: 0.5rem;">
                                    <span style="color: #48bb78;">✓</span>
                                    <span contenteditable="true" style="outline: none;">Cancel anytime</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>`
        },
        {
            id: 'footer-section',
            name: 'Footer Section',
            type: 'section',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
                    <rect width="200" height="100" fill="#1a202c"/>
                    <text x="100" y="30" text-anchor="middle" fill="#a0aec0" font-size="12">Footer</text>
                    <line x1="20" y1="45" x2="180" y2="45" stroke="#4a5568" stroke-width="1"/>
                    <text x="100" y="70" text-anchor="middle" fill="#718096" font-size="10">© 2024 Company</text>
                </svg>
            `),
            html: `<section class="editor-section footer-section" style="width: 100%; padding: 40px 0; background: #1a202c;">
                <div class="section-content" style="max-width: 1200px; margin: 0 auto; padding: 0 20px;">
                    <div class="editor-block" style="position: relative; margin-bottom: 2rem;">
                        <div class="three-column-container" style="display: flex; gap: 40px; color: #a0aec0;">
                            <div class="column" style="flex: 1;">
                                <h3 contenteditable="true" style="outline: none; color: white; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Company</h3>
                                <ul style="list-style: none; padding: 0; margin: 0;">
                                    <li style="margin-bottom: 0.5rem;"><a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">About Us</a></li>
                                    <li style="margin-bottom: 0.5rem;"><a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">Our Team</a></li>
                                    <li style="margin-bottom: 0.5rem;"><a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">Careers</a></li>
                                    <li style="margin-bottom: 0.5rem;"><a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">Contact</a></li>
                                </ul>
                            </div>
                            <div class="column" style="flex: 1;">
                                <h3 contenteditable="true" style="outline: none; color: white; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Products</h3>
                                <ul style="list-style: none; padding: 0; margin: 0;">
                                    <li style="margin-bottom: 0.5rem;"><a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">Features</a></li>
                                    <li style="margin-bottom: 0.5rem;"><a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">Pricing</a></li>
                                    <li style="margin-bottom: 0.5rem;"><a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">API</a></li>
                                    <li style="margin-bottom: 0.5rem;"><a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">Integrations</a></li>
                                </ul>
                            </div>
                            <div class="column" style="flex: 1;">
                                <h3 contenteditable="true" style="outline: none; color: white; font-size: 1.25rem; font-weight: 600; margin-bottom: 1rem;">Support</h3>
                                <ul style="list-style: none; padding: 0; margin: 0;">
                                    <li style="margin-bottom: 0.5rem;"><a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">Help Center</a></li>
                                    <li style="margin-bottom: 0.5rem;"><a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">Documentation</a></li>
                                    <li style="margin-bottom: 0.5rem;"><a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">Community</a></li>
                                    <li style="margin-bottom: 0.5rem;"><a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">Status</a></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    <div class="editor-block" style="position: relative; border-top: 1px solid #4a5568; padding-top: 2rem;">
                        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
                            <div>
                                <p contenteditable="true" style="outline: none; color: #718096; margin: 0;">© 2024 Your Company. All rights reserved.</p>
                            </div>
                            <div style="display: flex; gap: 1rem;">
                                <a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">Privacy Policy</a>
                                <a href="#" contenteditable="true" style="outline: none; color: #a0aec0; text-decoration: none;">Terms of Service</a>
                            </div>
                        </div>
                    </div>
                </div>
            </section>`
        }
    ],
    
    blocks: [
        {
            id: 'container-block',
            name: 'Container Block',
            type: 'block',
            preview: 'text', // 'text' or 'image'
            html: '<div class="content-container"></div>'
        },
        {
            id: 'two-column-block',
            name: 'Two Column Block',
            type: 'block',
            preview: 'text',
            html: '<div class="two-column-container" style="display: flex; gap: 20px;"><div class="column" style="flex: 1;"></div><div class="column" style="flex: 1;"></div></div>'
        },
        {
            id: 'three-column-block',
            name: 'Three Column Block',
            type: 'block',
            preview: 'text',
            html: '<div class="three-column-container" style="display: flex; gap: 20px;"><div class="column" style="flex: 1;"></div><div class="column" style="flex: 1;"></div><div class="column" style="flex: 1;"></div></div>'
        },
        {
            id: 'hero-block',
            name: 'Hero Block',
            type: 'block',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="200" height="100" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style="stop-color:#667eea"/>
                            <stop offset="100%" style="stop-color:#764ba2"/>
                        </linearGradient>
                    </defs>
                    <rect width="200" height="100" fill="url(#heroGrad)" rx="4"/>
                    <text x="100" y="40" text-anchor="middle" fill="white" font-size="16" font-weight="bold">Hero Title</text>
                    <text x="100" y="60" text-anchor="middle" fill="white" font-size="12">Hero subtitle goes here</text>
                </svg>
            `),
            html: '<div class="hero-container default-hero-bg" style="padding: 60px 20px; text-align: center;"><h1 style="color: white; font-size: 3rem; margin-bottom: 1rem;" contenteditable="true">Hero Title</h1><p style="color: white; font-size: 1.25rem;" contenteditable="true">Hero subtitle goes here</p></div>'
        }
    ],
    
    snippets: [
        {
            id: 'heading-snippet',
            name: 'Heading',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="150" height="40" xmlns="http://www.w3.org/2000/svg">
                    <rect width="150" height="40" fill="#f8f9fa" stroke="#e2e8f0" rx="4"/>
                    <text x="10" y="25" fill="#1f2937" font-size="18" font-weight="bold">Your Heading</text>
                </svg>
            `),
            html: '<h2 contenteditable="true">Your Heading Here</h2>'
        },
        {
            id: 'paragraph-snippet',
            name: 'Paragraph',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="150" height="60" xmlns="http://www.w3.org/2000/svg">
                    <rect width="150" height="60" fill="#f8f9fa" stroke="#e2e8f0" rx="4"/>
                    <line x1="10" y1="15" x2="140" y2="15" stroke="#6b7280" stroke-width="2"/>
                    <line x1="10" y1="25" x2="120" y2="25" stroke="#6b7280" stroke-width="2"/>
                    <line x1="10" y1="35" x2="135" y2="35" stroke="#6b7280" stroke-width="2"/>
                    <line x1="10" y1="45" x2="90" y2="45" stroke="#6b7280" stroke-width="2"/>
                </svg>
            `),
            html: '<p contenteditable="true">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>'
        },
        {
            id: 'button-snippet',
            name: 'Button',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="100" height="40" xmlns="http://www.w3.org/2000/svg">
                    <rect width="80" height="30" x="10" y="5" fill="#3b82f6" rx="4"/>
                    <text x="50" y="22" text-anchor="middle" fill="white" font-size="12" font-weight="bold">Click Me</text>
                </svg>
            `),
            html: '<button style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">Click Me</button>'
        },
        {
            id: 'list-snippet',
            name: 'List',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="120" height="60" xmlns="http://www.w3.org/2000/svg">
                    <rect width="120" height="60" fill="#f8f9fa" stroke="#e2e8f0" rx="4"/>
                    <circle cx="15" cy="15" r="3" fill="#6b7280"/>
                    <circle cx="15" cy="30" r="3" fill="#6b7280"/>
                    <circle cx="15" cy="45" r="3" fill="#6b7280"/>
                    <line x1="25" y1="15" x2="100" y2="15" stroke="#6b7280" stroke-width="2"/>
                    <line x1="25" y1="30" x2="90" y2="30" stroke="#6b7280" stroke-width="2"/>
                    <line x1="25" y1="45" x2="95" y2="45" stroke="#6b7280" stroke-width="2"/>
                </svg>
            `),
            html: '<ul><li contenteditable="true">First item</li><li contenteditable="true">Second item</li><li contenteditable="true">Third item</li></ul>'
        },
        {
            id: 'quote-snippet',
            name: 'Quote',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="150" height="60" xmlns="http://www.w3.org/2000/svg">
                    <rect width="150" height="60" fill="#f8f9fa" stroke="#e2e8f0" rx="4"/>
                    <rect x="5" y="10" width="4" height="40" fill="#3b82f6"/>
                    <text x="15" y="25" fill="#374151" font-size="11" font-style="italic">"Beautiful quote that</text>
                    <text x="15" y="38" fill="#374151" font-size="11" font-style="italic">inspires people"</text>
                    <text x="15" y="52" fill="#6b7280" font-size="9">— Author Name</text>
                </svg>
            `),
            html: '<blockquote style="border-left: 4px solid #3b82f6; padding-left: 1rem; font-style: italic;" contenteditable="true">"This is a beautiful quote that inspires people."<footer style="margin-top: 0.5rem; font-style: normal; color: #666;">— Author Name</footer></blockquote>'
        },
        {
            id: 'card-snippet',
            name: 'Card',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="150" height="80" xmlns="http://www.w3.org/2000/svg">
                    <rect width="150" height="80" fill="white" stroke="#e2e8f0" rx="8"/>
                    <rect x="5" y="5" width="140" height="70" fill="#fafafa" rx="4"/>
                    <text x="15" y="25" fill="#1f2937" font-size="14" font-weight="bold">Card Title</text>
                    <line x1="15" y1="35" x2="130" y2="35" stroke="#9ca3af" stroke-width="1"/>
                    <line x1="15" y1="45" x2="120" y2="45" stroke="#9ca3af" stroke-width="1"/>
                    <text x="15" y="65" fill="#3b82f6" font-size="10">Learn more →</text>
                </svg>
            `),
            html: '<div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.5rem; background: white; box-shadow: 0 2px 4px rgba(0,0,0,0.05);"><h3 style="margin-bottom: 0.5rem;" contenteditable="true">Card Title</h3><p style="color: #666;" contenteditable="true">Card content goes here. This is a simple card component.</p><a href="#" style="color: #3b82f6; text-decoration: none;" contenteditable="true">Learn more →</a></div>'
        },
        {
            id: 'image-snippet',
            name: 'Image',
            type: 'snippet',
            snippetType: 'image',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
                    <rect width="120" height="80" fill="#f3f4f6" stroke="#d1d5db" rx="4"/>
                    <circle cx="30" cy="25" r="8" fill="#9ca3af"/>
                    <polygon points="15,50 45,30 75,45 105,25 105,65 15,65" fill="#9ca3af"/>
                    <text x="60" y="45" text-anchor="middle" fill="#6b7280" font-size="10">Image</text>
                </svg>
            `),
            html: `<div class="image-container" style="position: relative; display: inline-block;"><img src="${window.DragonAssetsPath || 'assets/'}images/vase.jpg" alt="Default Image" style="max-width: 100%; height: auto; display: block;" class="editable-image"><div class="image-upload-zone" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); color: white; display: none; align-items: center; justify-content: center; cursor: pointer; font-size: 14px;">Click to change image</div></div>`
        },
        {
            id: 'video-snippet',
            name: 'Video',
            type: 'snippet',
            snippetType: 'video',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="120" height="80" xmlns="http://www.w3.org/2000/svg">
                    <rect width="120" height="80" fill="#000" rx="4"/>
                    <polygon points="45,30 45,50 70,40" fill="white"/>
                    <text x="60" y="65" text-anchor="middle" fill="#9ca3af" font-size="10">Video</text>
                </svg>
            `),
            html: '<div class="video-placeholder"></div>'
        },
        {
            id: 'divider-snippet',
            name: 'Divider',
            type: 'snippet',
            snippetType: 'text',
            preview: 'image',
            previewImage: svgToDataUrl(`
                <svg width="150" height="20" xmlns="http://www.w3.org/2000/svg">
                    <line x1="10" y1="10" x2="140" y2="10" stroke="#e2e8f0" stroke-width="2"/>
                </svg>
            `),
            html: '<hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;">'
        },
        {
            id: 'spacer-snippet',
            name: 'Spacer',
            type: 'snippet',
            snippetType: 'text',
            preview: 'text',
            html: '<div style="height: 40px;"></div>'
        }
        
        // Example snippets showing different image formats:
        // 
        // PNG example:
        // {
        //     id: 'custom-png-snippet',
        //     name: 'Custom PNG Block',
        //     type: 'snippet',
        //     preview: 'image',
        //     previewImage: 'https://example.com/preview.png',
        //     html: '<div>Custom content here</div>'
        // },
        //
        // WebP example:
        // {
        //     id: 'custom-webp-snippet', 
        //     name: 'Custom WebP Block',
        //     type: 'snippet',
        //     preview: 'image',
        //     previewImage: 'data:image/webp;base64,UklGRhYAAABXRUJQVlA4TAkAAAAvAQAAAAD+p5aEAA==',
        //     html: '<div>Custom content here</div>'
        // },
        //
        // GIF example:
        // {
        //     id: 'custom-gif-snippet',
        //     name: 'Custom GIF Block', 
        //     type: 'snippet',
        //     preview: 'image',
        //     previewImage: './assets/my-preview.gif',
        //     html: '<div>Custom content here</div>'
        // },
        //
        // JPEG example:
        // {
        //     id: 'custom-jpg-snippet',
        //     name: 'Custom JPEG Block',
        //     type: 'snippet', 
        //     preview: 'image',
        //     previewImage: './images/snippet-preview.jpg',
        //     html: '<div>Custom content here</div>'
        // }
        
    ]
};

// Function to get all sections
window.getSections = function() {
    return SNIPPET_LIBRARY.sections;
};

// Function to get all blocks
window.getBlocks = function() {
    return SNIPPET_LIBRARY.blocks;
};

// Function to get all snippets
window.getSnippets = function() {
    return SNIPPET_LIBRARY.snippets;
};

// Function to add a custom snippet
window.addCustomSnippet = function(snippet) {
    SNIPPET_LIBRARY.snippets.push(snippet);
};

// Function to get any item by ID (section, block, or snippet)
window.getSnippetById = function(id) {
    const allItems = [...SNIPPET_LIBRARY.sections, ...SNIPPET_LIBRARY.blocks, ...SNIPPET_LIBRARY.snippets];
    return allItems.find(item => item.id === id);
};

// Make SNIPPET_LIBRARY available globally
window.SNIPPET_LIBRARY = SNIPPET_LIBRARY;

// Export for use in the main editor
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { SNIPPET_LIBRARY, getSections, getBlocks, getSnippets, addCustomSnippet, getSnippetById };
}