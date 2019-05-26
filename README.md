![logo](https://avatars1.githubusercontent.com/u/20083774?s=460&v=4)
___________
# i18n-extended
###### created by  Andrew Wormald
__________

### Installation:
##### Step 1:
```bash
npm install i18n-extended
```

##### Step 2:
Ensure you are using routing as this directive works hand in hand with Agnular's Router.
```bash
import { NgSmartTabsModule } from 'i18n-extended';

@NgModule({
  imports: [
    NgSmartTabsModule,
  ],
})
```

##### Step 3:
```bash
<a ng-smart-tab>{{YOUR_TEXT}}</a>
```

| Attribute        | Default      | Tpe  |
| :------------- | :----------:| :-----:|
| lineColor | '#EF476F' | string |
| lineThickness | '1px' | string |
| lineBorderRadius | '0px' | string |
| isFollowLineInvisible     | false | boolean |
| activeOnUrlMatch | null | string |
| underlineSidePadding | 0 | number |
| horizontalChangeSpeed | '1' | string |
| verticalChangeSpeed | '1' | string |
| opacityChangeSpeed | '1.25' | string |
| widthChangeSpeed | '0.35s' | string |
| zIndex | 1 | number |


### For example:
```html
<a ng-smart-tab
   activeOnUrlMatch="/path">{{YOUR_TEXT}}</a>
```

```html
<!-- The matching alogithim is a basic javascipt .contains()
 method and priorities direct matches. Thus only provide
 what is unique for that url/journey. -->
 
<a ng-smart-tab
   activeOnUrlMatch="/path/">{{YOUR_TEXT}}</a>
```

```html
<a ng-smart-tab
   opacityChangeSpeed="2.35">{{YOUR_TEXT}}</a>
```

```html
<a ng-smart-tab
   lineColor="#eee">{{YOUR_TEXT}}</a>
```
___________