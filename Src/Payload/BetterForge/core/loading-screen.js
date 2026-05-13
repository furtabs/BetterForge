(function() {
    'use strict';
    
    // Prevent multiple initializations
    if (window.__betterForgeLoadingScreen) {
        return;
    }
    window.__betterForgeLoadingScreen = true;
    
    // Text patterns to replace (case-insensitive)
    const textPatterns = [
        /forging\s+your\s+library/gi,
        /forging\s+library/gi,
        /forging/gi
    ];
    
    const replacementText = 'Initializing BetterForge';
        
    // Function to add splash image to loading screen
    function addSplashImage() {
        // Try to find common loading screen containers
        const possibleContainers = [
            document.querySelector('[class*="loading"]'),
            document.querySelector('[class*="splash"]'),
            document.querySelector('[class*="loader"]'),
            document.querySelector('[id*="loading"]'),
            document.querySelector('[id*="splash"]'),
            document.body
        ];
        
        let container = null;
        for (const candidate of possibleContainers) {
            if (candidate) {
                container = candidate;
                break;
            }
        }
        
        if (!container) return;
        
        // Check if image already added
        if (container.querySelector('#__betterForge_splash_image')) {
            return;
        }
            
    // Function to replace text in a text node
    function replaceTextInNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            let text = node.textContent;
            let replaced = false;
            
            // First, check if text already contains "Initializing BetterForge" with dots and clean it
            if (/Initializing\s+BetterForge\s*[\.…]+/i.test(text)) {
                text = text.replace(/Initializing\s+BetterForge\s*[\.…]+/gi, replacementText);
                replaced = true;
            }
            
            // Then check for the original patterns
            for (const pattern of textPatterns) {
                if (pattern.test(text)) {
                    text = text.replace(pattern, replacementText);
                    // Remove trailing dots, ellipsis (…), and spaces after replacement
                    text = text.replace(/\s*[\.…]{1,}\s*$/g, '');
                    replaced = true;
                    
                    // When we find the loading text, try to add the splash image
                    if (replaced) {
                        setTimeout(addSplashImage, 100);
                    }
                }
            }
            
            if (replaced) {
                node.textContent = text;
            }
        }
    }
    
    // Function to recursively search and replace text in all nodes
    function replaceTextInTree(root) {
        const walker = document.createTreeWalker(
            root,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        textNodes.forEach(replaceTextInNode);
    }
    
    // Initial replacement on existing content
    function initialReplace() {
        replaceTextInTree(document.body);
        // Also try to add splash image initially
        setTimeout(addSplashImage, 200);
    }
    
    // Watch for new content being added
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        replaceTextInTree(node);
                    } else if (node.nodeType === Node.TEXT_NODE) {
                        replaceTextInNode(node);
                    }
                });
            } else if (mutation.type === 'characterData') {
                replaceTextInNode(mutation.target);
            }
        });
    });
    
    // Start observing when DOM is ready
    function startObserving() {
        if (document.body) {
            initialReplace();
            
            observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true
            });
        } else {
            // Wait for body to be available
            setTimeout(startObserving, 100);
        }
    }
    
    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startObserving);
    } else {
        startObserving();
    }
})();

