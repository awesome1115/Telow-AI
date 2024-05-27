# Use an official Node.js runtime as a parent image
FROM node:18

RUN apt-get update && apt-get install -y \
    gconf-service libasound2 libatk1.0-0 libc6 libcairo2 libcups2 \
    libdbus-1-3 libexpat1 libfontconfig1 libgcc1 libgconf-2-4 \
    libgdk-pixbuf2.0-0 libglib2.0-0 libgtk-3-0 libnspr4 \
    libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 \
    libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 \
    libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 \
    libxtst6 ca-certificates fonts-liberation libappindicator1 \
    libnss3 lsb-release xdg-utils wget libgbm-dev libnss3-dev

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY ./ExpressAPI/* /app

# Install app dependencies
RUN yarn global add nodemon
RUN yarn install --production --ignore-engines

# Copy the rest of the application code to the working directory
COPY . .

# Expose the port your Express.js application will run on (change 3000 to your desired port)
EXPOSE 5001

# Define the command to run your Express.js application
CMD ["nodemon", "server.js"] 