## Requirements
    - Docker
    - Node 18.5+
    - Yarn
    - Dev .env File (Ask Developers)

## Start
1. Instal Docker Desktop on your machine
2. run `./start.sh` in root or `docker compose up`

## Setup


### Billing Setting
You can use any test card from Stripe to start creating instances and testing different variations of the billing system: https://docs.stripe.com/testing


### PROD Deployment 
The project is using CI/CD through AWS. When your code is merged in main branch, it will trigger PROD build.

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Resource Access:

    - localhost:1000 (Authorizer)
    - localhost:2000 (Hasura API/Creation [If you are editing columns, make sure to add it in db/schemas corresponded .sql file])
    - localhost:3000 (Telow App)

The page will reload if you make edits.\
You will also see any lint errors in the console.

### Development Structure

```
.
├── Dockerfile.dev
├── ExpressAPI/                     // NOT UTILIZED YET / USED FOR INTERNAL APP API
├── src/                
│   ├── API/                        // Contains all Apollo API call related files
│   ├── Service /                   // Services
│   ├── Contexts /                  // Wrapper / Context of App.
│   ├── Shared/                     // Contains allShared components
│   │   ├── Header/                 // Example
│   │   │   ├── Header.tsx
│   │   │   ├── Header.test.tsx
│   │   │   └── Header.scss
│   │   └── ...
│   ├── Components /                // Components (Most Components are within Pages directory related to page itself)
│   │   └── ...
│   ├── Pages /                     // Pages (Pages represent whole screen. Like Dashboard, Settings etc)
│   │   └── ...
│   ├── Routers /                   // Routers Settings 
│   ├── States /                    // All Zustland State Management 
│   ├── types/                      // Contains TypeScript type definitions
│   ├── App.scss
│   ├── App.test.tsx
│   └── App.tsx
│   └── Root.tsx                    // APP STARTING POINT
```
