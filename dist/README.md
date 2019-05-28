![logo](https://raw.githubusercontent.com/SwiftySpartan/i18n-extended/master/angular.png)
___________
# i18n-extended
##### created by  Andrew Wormald
###### SwiftySpartan / @andrewwormald
#

### Installation:
##### Step 1:
###### Navigate to your angular directory that has all your angular projects.
```bash
    npm install i18n-extended --save
```

##### Step 2:
```bash
    i18n-extended --angularProjectPath="./projects/{{your project name}}"
```

##### Step 3:
###### Navigate to the component you want to use this service in.
```javascript
   import { i18nExtended } from '@andrewwormald/i18n-extended';
```

##### Step 4:
```typescript
   class myComponent {
        title: string;
        
        constructor(private translateService: i18nExtended) {
            // This needs to match the <target-language> attribute value in the .xlf file>
            this.translateService.setLanguage('fr');
        }
        
        myMethod() {
            // Calling `translateText()` will be part of marking the text for extraction
            // as well as fetching the translated text at runtime. If nothing is found or if
            // the text has not yet been translated, the provided text will be returned as is.  
            this.title = this.translateService.translateText('I like i18n-extended!');
        }
   }
```

##### Example:
```typescript
  import { i18nExtended } from '@andrewwormald/i18n-extended';

   class myComponent {
        title: string;
        
        constructor(private translateService: i18nExtended) {
            // This needs to match the <target-language> attribute value in the .xlf file>
            this.translateService.setLanguage('fr');
        }
        
        myMethod() {
            // Calling `translateText()` will be part of marking the text for extraction
            // as well as fetching the translated text at runtime. If nothing is found or if
            // the text has not yet been translated, the provided text will be returned as is.  
            this.title = this.translateService.translateText('I like i18n-extended!');
        }
   }
```