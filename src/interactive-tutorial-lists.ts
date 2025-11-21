// src/plugins/interactive-tutorial-lists.ts
import type { AstroIntegration } from 'astro';

export default function interactiveTutorialLists(): AstroIntegration {
  return {
    name: 'interactive-tutorial-lists',
    hooks: {
      'astro:config:setup': ({ injectScript }) => {
        // Inline all the code to avoid import issues
        injectScript('page', `
          (function() {
            // Only run in browser
            if (typeof window === 'undefined') return;
            
            // CSS styles for the tutorial lists
            function getStylesCSS() {
              return \`
                /* Basic tutorial list styling */
                .tutorial-list { 
                  list-style: none; 
                  padding: 0; 
                  margin: 1rem 0;
                  counter-reset: step; 
                  position: relative;
                }
                
                .tutorial-item { 
                  position: relative; 
                  padding-left: 3rem; 
                  margin: 1.5rem 0; 
                  counter-increment: step;
                  transition: all 0.3s ease;
                  opacity: 1;
                }
                
                /* Always visible progress line with step color */
                .tutorial-item::before {
                  content: '';
                  position: absolute;
                  top: 1.25rem;
                  left: 1rem;
                  width: 1px;
                  height: calc(100% + 1.5rem); 
                  background-color: #4b5563;
                  transform: translateX(-50%) scaleY(1);
                  transform-origin: top;
                  transition: background-color 0.6s ease-out;
                  z-index: 5;
                }

                .tutorial-item.completed::before {
                  background-color: #10b981;
                }
                
                .tutorial-item:last-child::before {
                  display: none;
                }
                
                .step-circle { 
                  position: absolute; 
                  left: 0; 
                  top: -0.1rem; 
                  width: 2rem; 
                  height: 2rem; 
                  border-radius: 50%; 
                  background: #374151; 
                  color: white; 
                  display: flex; 
                  align-items: center; 
                  justify-content: center; 
                  cursor: pointer;
                  font-weight: 500;
                  font-size: 0.875rem;
                  transition: all 0.2s ease;
                  user-select: none;
                  z-index: 10;
                  border: 2px solid #4b5563;
                }
                
                .step-circle::before { 
                  content: counter(step); 
                }
                
                .step-circle:hover {
                  background: #4b5563;
                  border-color: #6b7280;
                  transform: scale(1.05);
                }
                
                .tutorial-item.completed .step-circle { 
                  background: #62b89bff;
                  border-color: #059669;
                }
                
                .tutorial-item.completed .step-circle::before { 
                  content: '✓'; 
                  font-size: 1rem;
                }
                
                .tutorial-item.next-glow .step-circle {
                  animation: nextStepGlow 0.8s ease-out;
                }
                
                @keyframes nextStepGlow {
                  0% { box-shadow: 0 0 0 0 #10b981; transform: scale(1); }
                  50% { box-shadow: 0 0 2px 2px #6bdbb5ff; transform: scale(1.05); } 
                  100% { box-shadow: 0 0 0 0 #50ffc5ff; transform: scale(1); }
                }
                
                @media (max-width: 640px) {
                  .tutorial-item {
                    padding-left: 2.5rem;
                    margin: 1.25rem 0;
                  }
                  .step-circle {
                    width: 1.75rem;
                    height: 1.75rem;
                    font-size: 0.75rem;
                  }
                  .tutorial-item::before {
                    left: 0.875rem;
                    height: calc(100% + 1.25rem);
                  }
                }
              \`;
            }

            // Inject CSS styles into the document
            function injectStyles() {
              if (document.querySelector('#tutorial-lists-minimal')) return;
              
              const style = document.createElement('style');
              style.id = 'tutorial-lists-minimal';
              style.textContent = getStylesCSS();
              document.head.appendChild(style);
            }

            // Handle step completion/incompletion logic
            function toggleStepCompletion(item, items) {
              const isCompleted = item.classList.contains('completed');
              const nextItem = item.nextElementSibling;
              
              if (isCompleted) {
                unmarkStep(item, nextItem);
              } else {
                markStep(item, items, nextItem);
              }
            }

            // Mark a step as completed and handle cascading
            function markStep(item, items, nextItem) {
              // First mark all previous unmarked items
              const itemsArray = Array.from(items);
              const currentIndex = itemsArray.indexOf(item);
              
              for (let i = 0; i < currentIndex; i++) {
                if (!itemsArray[i].classList.contains('completed')) {
                  itemsArray[i].classList.add('completed');
                }
              }
              
              // Mark current item
              item.classList.add('completed');
              
              // Add glow effect to next step
              addNextStepGlow(nextItem);
            }

            // Unmark a step and all following steps
            function unmarkStep(item, nextItem) {
              item.classList.remove('completed');
              
              let currentItem = nextItem;
              while (currentItem && currentItem.classList.contains('tutorial-item')) {
                currentItem.classList.remove('completed', 'next-glow');
                currentItem = currentItem.nextElementSibling;
              }
            }

            // Add glow effect to the next available step
            function addNextStepGlow(nextItem) {
              if (nextItem && nextItem.classList.contains('tutorial-item')) {
                nextItem.classList.add('next-glow');
                setTimeout(() => {
                  if (nextItem) nextItem.classList.remove('next-glow');
                }, 1200);
              }
            }

            // Create and configure a step circle element
            function createStepCircle(item, items, index) {
              const circle = document.createElement('div');
              circle.className = 'step-circle';
              
              // Set accessibility attributes
              circle.setAttribute('role', 'button');
              circle.setAttribute('tabindex', '0');
              circle.setAttribute('aria-label', \`Step \${index + 1}\`);
              
              // Add click handler
              circle.onclick = function() {
                toggleStepCompletion(item, items);
              };
              
              // Add keyboard handler
              circle.onkeydown = function(e) {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  circle.onclick();
                }
              };
              
              return circle;
            }

            // Enhance a single list item with interactive functionality
            function enhanceListItem(item, items, index) {
              item.classList.add('tutorial-item');
              
              const circle = createStepCircle(item, items, index);
              item.insertBefore(circle, item.firstChild);
            }

            // Process a single ordered list
            function enhanceList(list) {
              if (list.classList.contains('tutorial-list')) return;
              
              list.classList.add('tutorial-list');
              const items = list.querySelectorAll('li');
              
              items.forEach((item, index) => {
                enhanceListItem(item, items, index);
              });
            }

            // Find and enhance all tutorial lists in containers
            function enhanceAllLists() {
              const containers = document.querySelectorAll('nextsteps, NextSteps, [data-nextsteps]');
              
              containers.forEach(container => {
                const lists = container.querySelectorAll('ol');
                lists.forEach(enhanceList);
              });
            }

            // Main initialization function
            function init() {
              injectStyles();
              enhanceAllLists();
            }
            
            // Initialize when DOM is ready
            if (document.readyState === 'loading') {
              document.addEventListener('DOMContentLoaded', init);
            } else {
              init();
            }
          })();
        `);
      },
    },
  };
}