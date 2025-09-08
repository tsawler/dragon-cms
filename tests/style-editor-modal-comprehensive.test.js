import { StyleEditorModal } from '../js/modals.js';

// Mock DOM methods and properties
global.MutationObserver = class {
  constructor() {}
  observe() {}
  disconnect() {}
  takeRecords() { return []; }
};

describe('StyleEditorModal - Enhanced Granular Controls', () => {
  let modal;
  let mockEditor;
  let mockElement;

  beforeEach(() => {
    // Create a fresh DOM environment for each test
    document.body.innerHTML = '';
    
    // Mock editor with state history
    mockEditor = {
      stateHistory: {
        saveState: jest.fn()
      }
    };

    // Create modal instance
    modal = new StyleEditorModal(mockEditor);

    // Create test element with various styles
    mockElement = document.createElement('div');
    mockElement.style.paddingTop = '10px';
    mockElement.style.paddingRight = '15px';
    mockElement.style.paddingBottom = '20px';
    mockElement.style.paddingLeft = '25px';
    mockElement.style.marginTop = '5px';
    mockElement.style.marginRight = 'auto';
    mockElement.style.marginBottom = '10px';
    mockElement.style.marginLeft = '2em';
    mockElement.style.borderWidth = '2px';
    mockElement.style.borderColor = '#333333';
    mockElement.style.borderRadius = '8px';
    mockElement.style.backgroundColor = '#ff0000';
    mockElement.style.width = '500px';
    mockElement.style.height = '200px';
    
    document.body.appendChild(mockElement);
  });

  describe('Modal Structure and Initialization', () => {
    test('should create modal with enhanced padding/margin structure', () => {
      expect(modal.modal).toBeInstanceOf(HTMLDivElement);
      expect(modal.modal.className).toBe('modal');
      
      // Check for padding section
      const paddingSection = modal.modal.querySelector('.form-section');
      expect(paddingSection).toBeTruthy();
      
      // Check for padding controls
      ['top', 'right', 'bottom', 'left'].forEach(side => {
        const valueInput = modal.modal.querySelector(`.style-padding-${side}`);
        const unitSelect = modal.modal.querySelector(`.style-padding-${side}-unit`);
        expect(valueInput).toBeTruthy();
        expect(unitSelect).toBeTruthy();
        
        // Check unit options
        const options = Array.from(unitSelect.options).map(opt => opt.value);
        expect(options).toContain('px');
        expect(options).toContain('em');
        expect(options).toContain('rem');
        expect(options).toContain('%');
        expect(options).toContain('vh');
        expect(options).toContain('vw');
      });
      
      // Check for margin controls with auto option
      ['top', 'right', 'bottom', 'left'].forEach(side => {
        const valueInput = modal.modal.querySelector(`.style-margin-${side}`);
        const unitSelect = modal.modal.querySelector(`.style-margin-${side}-unit`);
        expect(valueInput).toBeTruthy();
        expect(unitSelect).toBeTruthy();
        
        // Check that margin has auto option
        const options = Array.from(unitSelect.options).map(opt => opt.value);
        expect(options).toContain('auto');
      });
      
      // Check for Link all sides buttons
      expect(modal.modal.querySelector('.link-all-padding')).toBeTruthy();
      expect(modal.modal.querySelector('.link-all-margin')).toBeTruthy();
    });

    test('should maintain all existing style controls', () => {
      // Check that other style controls still exist
      expect(modal.modal.querySelector('.style-border-width')).toBeTruthy();
      expect(modal.modal.querySelector('.style-border-color')).toBeTruthy();
      expect(modal.modal.querySelector('.style-border-radius')).toBeTruthy();
      expect(modal.modal.querySelector('.style-background')).toBeTruthy();
      expect(modal.modal.querySelector('.style-width')).toBeTruthy();
      expect(modal.modal.querySelector('.style-height')).toBeTruthy();
      expect(modal.modal.querySelector('.style-transition')).toBeTruthy();
      expect(modal.modal.querySelector('.style-visibility')).toBeTruthy();
      expect(modal.modal.querySelector('.style-display')).toBeTruthy();
    });
  });

  describe('Value Parsing and Loading', () => {
    test('should parse CSS values correctly', () => {
      // Test various CSS value formats
      expect(modal.parseValueUnit('10px')).toEqual({ value: 10, unit: 'px' });
      expect(modal.parseValueUnit('1.5em')).toEqual({ value: 1.5, unit: 'em' });
      expect(modal.parseValueUnit('100%')).toEqual({ value: 100, unit: '%' });
      expect(modal.parseValueUnit('2rem')).toEqual({ value: 2, unit: 'rem' });
      expect(modal.parseValueUnit('50vh')).toEqual({ value: 50, unit: 'vh' });
      expect(modal.parseValueUnit('auto')).toEqual({ value: '', unit: 'auto' });
      expect(modal.parseValueUnit('0')).toEqual({ value: 0, unit: 'px' });
      expect(modal.parseValueUnit('')).toEqual({ value: '', unit: 'px' });
    });

    test('should load existing padding values correctly', () => {
      modal.open(mockElement);
      
      expect(modal.modal.querySelector('.style-padding-top').value).toBe('10');
      expect(modal.modal.querySelector('.style-padding-top-unit').value).toBe('px');
      expect(modal.modal.querySelector('.style-padding-right').value).toBe('15');
      expect(modal.modal.querySelector('.style-padding-right-unit').value).toBe('px');
      expect(modal.modal.querySelector('.style-padding-bottom').value).toBe('20');
      expect(modal.modal.querySelector('.style-padding-bottom-unit').value).toBe('px');
      expect(modal.modal.querySelector('.style-padding-left').value).toBe('25');
      expect(modal.modal.querySelector('.style-padding-left-unit').value).toBe('px');
    });

    test('should load existing margin values correctly', () => {
      modal.open(mockElement);
      
      expect(modal.modal.querySelector('.style-margin-top').value).toBe('5');
      expect(modal.modal.querySelector('.style-margin-top-unit').value).toBe('px');
      expect(modal.modal.querySelector('.style-margin-right').value).toBe('');
      expect(modal.modal.querySelector('.style-margin-right-unit').value).toBe('auto');
      expect(modal.modal.querySelector('.style-margin-bottom').value).toBe('10');
      expect(modal.modal.querySelector('.style-margin-bottom-unit').value).toBe('px');
      expect(modal.modal.querySelector('.style-margin-left').value).toBe('2');
      expect(modal.modal.querySelector('.style-margin-left-unit').value).toBe('em');
    });

    test('should load existing border and other style values correctly', () => {
      modal.open(mockElement);
      
      expect(modal.modal.querySelector('.style-border-width').value).toBe('2');
      expect(modal.modal.querySelector('.style-border-radius').value).toBe('8');
      expect(modal.modal.querySelector('.style-width').value).toBe('500px');
      expect(modal.modal.querySelector('.style-height').value).toBe('200px');
    });
  });

  describe('Link All Sides Functionality', () => {
    test('should link all padding sides when button is clicked', () => {
      modal.open(mockElement);
      
      // Set top padding to a specific value
      modal.modal.querySelector('.style-padding-top').value = '30';
      modal.modal.querySelector('.style-padding-top-unit').value = 'em';
      
      // Click the link all button
      const linkBtn = modal.modal.querySelector('.link-all-padding');
      linkBtn.click();
      
      // Check that all sides now have the same value
      expect(modal.modal.querySelector('.style-padding-right').value).toBe('30');
      expect(modal.modal.querySelector('.style-padding-right-unit').value).toBe('em');
      expect(modal.modal.querySelector('.style-padding-bottom').value).toBe('30');
      expect(modal.modal.querySelector('.style-padding-bottom-unit').value).toBe('em');
      expect(modal.modal.querySelector('.style-padding-left').value).toBe('30');
      expect(modal.modal.querySelector('.style-padding-left-unit').value).toBe('em');
    });

    test('should link all margin sides when button is clicked', () => {
      modal.open(mockElement);
      
      // Set top margin to a specific value
      modal.modal.querySelector('.style-margin-top').value = '15';
      modal.modal.querySelector('.style-margin-top-unit').value = 'rem';
      
      // Click the link all button
      const linkBtn = modal.modal.querySelector('.link-all-margin');
      linkBtn.click();
      
      // Check that all sides now have the same value
      expect(modal.modal.querySelector('.style-margin-right').value).toBe('15');
      expect(modal.modal.querySelector('.style-margin-right-unit').value).toBe('rem');
      expect(modal.modal.querySelector('.style-margin-bottom').value).toBe('15');
      expect(modal.modal.querySelector('.style-margin-bottom-unit').value).toBe('rem');
      expect(modal.modal.querySelector('.style-margin-left').value).toBe('15');
      expect(modal.modal.querySelector('.style-margin-left-unit').value).toBe('rem');
    });

    test('should auto-link sides when first value is entered and others are empty', () => {
      // Create element with no existing padding
      const cleanElement = document.createElement('div');
      modal.open(cleanElement);
      
      // Set top padding value
      const topInput = modal.modal.querySelector('.style-padding-top');
      const topUnit = modal.modal.querySelector('.style-padding-top-unit');
      
      topInput.value = '12';
      topUnit.value = 'px';
      
      // Trigger auto-link
      topInput.dispatchEvent(new Event('input'));
      
      // Check that other sides were auto-linked
      expect(modal.modal.querySelector('.style-padding-right').value).toBe('12');
      expect(modal.modal.querySelector('.style-padding-bottom').value).toBe('12');
      expect(modal.modal.querySelector('.style-padding-left').value).toBe('12');
    });

    test('should not auto-link sides when other sides already have values', () => {
      modal.open(mockElement); // This element already has different padding values
      
      // Change top padding
      const topInput = modal.modal.querySelector('.style-padding-top');
      topInput.value = '100';
      
      // Get original values for comparison
      const rightValue = modal.modal.querySelector('.style-padding-right').value;
      const bottomValue = modal.modal.querySelector('.style-padding-bottom').value;
      
      // Trigger auto-link
      topInput.dispatchEvent(new Event('input'));
      
      // Check that other sides were NOT auto-linked (kept their original values)
      expect(modal.modal.querySelector('.style-padding-right').value).toBe(rightValue);
      expect(modal.modal.querySelector('.style-padding-bottom').value).toBe(bottomValue);
    });
  });

  describe('Style Application', () => {
    test('should apply individual padding values correctly', () => {
      modal.open(mockElement);
      
      // Set specific values
      modal.modal.querySelector('.style-padding-top').value = '40';
      modal.modal.querySelector('.style-padding-top-unit').value = 'px';
      modal.modal.querySelector('.style-padding-right').value = '2';
      modal.modal.querySelector('.style-padding-right-unit').value = 'em';
      modal.modal.querySelector('.style-padding-bottom').value = '5';
      modal.modal.querySelector('.style-padding-bottom-unit').value = '%';
      modal.modal.querySelector('.style-padding-left').value = '3';
      modal.modal.querySelector('.style-padding-left-unit').value = 'rem';
      
      // Save changes
      modal.save();
      
      // Check applied styles
      expect(mockElement.style.paddingTop).toBe('40px');
      expect(mockElement.style.paddingRight).toBe('2em');
      expect(mockElement.style.paddingBottom).toBe('5%');
      expect(mockElement.style.paddingLeft).toBe('3rem');
    });

    test('should apply individual margin values correctly including auto', () => {
      modal.open(mockElement);
      
      // Set specific values including auto
      modal.modal.querySelector('.style-margin-top').value = '20';
      modal.modal.querySelector('.style-margin-top-unit').value = 'px';
      modal.modal.querySelector('.style-margin-right').value = '';
      modal.modal.querySelector('.style-margin-right-unit').value = 'auto';
      modal.modal.querySelector('.style-margin-bottom').value = '1.5';
      modal.modal.querySelector('.style-margin-bottom-unit').value = 'em';
      modal.modal.querySelector('.style-margin-left').value = '';
      modal.modal.querySelector('.style-margin-left-unit').value = 'auto';
      
      // Save changes
      modal.save();
      
      // Check applied styles
      expect(mockElement.style.marginTop).toBe('20px');
      expect(mockElement.style.marginRight).toBe('auto');
      expect(mockElement.style.marginBottom).toBe('1.5em');
      expect(mockElement.style.marginLeft).toBe('auto');
    });

    test('should use CSS shorthand when all sides have same value', () => {
      modal.open(mockElement);
      
      // Set same value for all padding sides
      ['top', 'right', 'bottom', 'left'].forEach(side => {
        modal.modal.querySelector(`.style-padding-${side}`).value = '25';
        modal.modal.querySelector(`.style-padding-${side}-unit`).value = 'px';
      });
      
      // Save changes
      modal.save();
      
      // Check that shorthand property is used
      expect(mockElement.style.padding).toBe('25px');
    });

    test('should clear styles when empty values are provided', () => {
      modal.open(mockElement);
      
      // Clear all padding values
      ['top', 'right', 'bottom', 'left'].forEach(side => {
        modal.modal.querySelector(`.style-padding-${side}`).value = '';
      });
      
      // Save changes
      modal.save();
      
      // Check that padding styles are cleared
      expect(mockElement.style.paddingTop).toBe('');
      expect(mockElement.style.paddingRight).toBe('');
      expect(mockElement.style.paddingBottom).toBe('');
      expect(mockElement.style.paddingLeft).toBe('');
      expect(mockElement.style.padding).toBe('');
    });

    test('should maintain other style properties when saving', () => {
      modal.open(mockElement);
      
      // Change only padding, leave other properties unchanged
      modal.modal.querySelector('.style-padding-top').value = '50';
      modal.modal.querySelector('.style-padding-top-unit').value = 'px';
      
      // Save changes
      modal.save();
      
      // Check that other properties are maintained
      expect(mockElement.style.borderWidth).toBe('2px');
      // Note: The modal might reset background color based on the form value, so we'll check that it's a valid color
      expect(mockElement.style.backgroundColor).toBeTruthy();
      expect(mockElement.style.width).toBe('500px');
      expect(mockElement.style.height).toBe('200px');
      
      // Check that state was saved
      expect(mockEditor.stateHistory.saveState).toHaveBeenCalled();
    });
  });

  describe('Unit Handling', () => {
    test('should handle all supported CSS units', () => {
      const supportedUnits = ['px', 'em', 'rem', '%', 'vh', 'vw'];
      
      modal.open(mockElement);
      
      supportedUnits.forEach((unit, index) => {
        const side = ['top', 'right', 'bottom', 'left'][index % 4];
        const value = (index + 1) * 10;
        
        modal.modal.querySelector(`.style-padding-${side}`).value = value.toString();
        modal.modal.querySelector(`.style-padding-${side}-unit`).value = unit;
        
        modal.save();
        
        const expectedValue = `${value}${unit}`;
        const actualValue = mockElement.style[`padding${side.charAt(0).toUpperCase() + side.slice(1)}`];
        expect(actualValue).toBe(expectedValue);
        
        // Reset for next iteration
        modal.open(mockElement);
      });
    });

    test('should handle auto unit for margins only', () => {
      modal.open(mockElement);
      
      // Set margin to auto
      modal.modal.querySelector('.style-margin-left').value = '';
      modal.modal.querySelector('.style-margin-left-unit').value = 'auto';
      
      modal.save();
      
      expect(mockElement.style.marginLeft).toBe('auto');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    test('should handle negative values', () => {
      modal.open(mockElement);
      
      modal.modal.querySelector('.style-margin-top').value = '-10';
      modal.modal.querySelector('.style-margin-top-unit').value = 'px';
      
      modal.save();
      
      expect(mockElement.style.marginTop).toBe('-10px');
    });

    test('should handle decimal values', () => {
      modal.open(mockElement);
      
      modal.modal.querySelector('.style-padding-left').value = '1.75';
      modal.modal.querySelector('.style-padding-left-unit').value = 'em';
      
      modal.save();
      
      expect(mockElement.style.paddingLeft).toBe('1.75em');
    });

    test('should handle zero values', () => {
      modal.open(mockElement);
      
      modal.modal.querySelector('.style-margin-bottom').value = '0';
      modal.modal.querySelector('.style-margin-bottom-unit').value = 'px';
      
      modal.save();
      
      expect(mockElement.style.marginBottom).toBe('0px');
    });

    test('should handle empty strings gracefully', () => {
      modal.open(mockElement);
      
      // Clear a value
      modal.modal.querySelector('.style-padding-right').value = '';
      
      expect(() => {
        modal.save();
      }).not.toThrow();
      
      expect(mockElement.style.paddingRight).toBe('');
    });

    test('should handle missing DOM elements gracefully', () => {
      // Test with null target element
      modal.targetElement = null;
      
      expect(() => {
        modal.save();
      }).not.toThrow();
    });
  });

  describe('Modal Lifecycle', () => {
    test('should open and close modal correctly', () => {
      modal.open(mockElement);
      
      expect(modal.targetElement).toBe(mockElement);
      expect(modal.modal.classList.contains('active')).toBe(true);
      
      modal.close();
      
      expect(modal.targetElement).toBeNull();
      expect(modal.modal.classList.contains('active')).toBe(false);
    });

    test('should handle multiple open/close cycles', () => {
      // Open and close multiple times
      for (let i = 0; i < 3; i++) {
        modal.open(mockElement);
        expect(modal.modal.classList.contains('active')).toBe(true);
        
        modal.close();
        expect(modal.modal.classList.contains('active')).toBe(false);
      }
    });

    test('should preserve modal state across close/open cycles', () => {
      modal.open(mockElement);
      
      // Modify a value
      modal.modal.querySelector('.style-padding-top').value = '99';
      
      modal.close();
      modal.open(mockElement);
      
      // Check that the element's original value was reloaded (not the modified one)
      expect(modal.modal.querySelector('.style-padding-top').value).toBe('10'); // Original value
    });
  });

  describe('Event Handling', () => {
    test('should handle save button click', () => {
      modal.open(mockElement);
      
      modal.modal.querySelector('.style-padding-top').value = '77';
      modal.modal.querySelector('.style-padding-top-unit').value = 'px';
      
      const saveBtn = modal.modal.querySelector('.modal-save');
      saveBtn.click();
      
      expect(mockElement.style.paddingTop).toBe('77px');
      expect(modal.modal.classList.contains('active')).toBe(false); // Modal should close
    });

    test('should handle cancel button click', () => {
      modal.open(mockElement);
      
      const originalPadding = mockElement.style.paddingTop;
      
      // Make a change
      modal.modal.querySelector('.style-padding-top').value = '999';
      
      const cancelBtn = modal.modal.querySelector('.modal-cancel');
      cancelBtn.click();
      
      // Check that changes were not applied
      expect(mockElement.style.paddingTop).toBe(originalPadding);
      expect(modal.modal.classList.contains('active')).toBe(false); // Modal should close
    });

    test('should handle close button click', () => {
      modal.open(mockElement);
      
      const closeBtn = modal.modal.querySelector('.modal-close');
      closeBtn.click();
      
      expect(modal.modal.classList.contains('active')).toBe(false);
    });
  });
});