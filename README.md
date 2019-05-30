![logo](https://raw.githubusercontent.com/SwiftySpartan/i18n-extended/master/angular.png)
___________
# i18n-extended
##### created by  Andrew Wormald
###### SwiftySpartan / @andrewwormald
#
####Notes
<p> You must install this gloablly to easily execute
 the command from anywhere without having to use
 `./node_modules/.bin/i18n-extended` executable </p>

### Installation:
##### Step 1:
<p> Navigate to your angular directory that has all your angular projects.</p>

```bash
    npm install -g @andrewwormald/i18n-extended@latest --save
```

##### Step 2:
<p>You need to run the command in your angular project directory</p>

```bash
    i18n-extended 
```

<p>If the above doesnt work try the following in your Angular app directory</p>

```bash
    ./node_modules/.bin/i18n-extended 
```

##### Step 3:

<p>Configure i18n-extended service in your app.module.ts file</p>

```typescript jsx
    import { i18nExtended, I18N_EXTENDED_DATA } from '@andrewwormald/i18n-extended';
    
    // This file is generated at the root of the app
    import { i18nDataMap } from '../../../../i18n.extended.map';
    
    providers: [
        {
          provide: I18N_EXTENDED_DATA,
          useValue: (() => { return new i18nDataMap().getTranslationStrings() }),
        },
    ]
```

##### Step 4:
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
