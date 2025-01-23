# Step 1: Use official Node.js image as the base image
FROM node:16 AS build

# Step 2: Set the working directory inside the container
WORKDIR /app

# Step 3: Copy package.json and package-lock.json (or yarn.lock) to the container
COPY package.json package-lock.json ./

# Step 4: Install the dependencies
RUN npm install

# Step 5: Copy the rest of the application files to the container
COPY . .

# Step 6: Build the React app for production
RUN npm run build

# Step 7: Use a lightweight web server to serve the built app (nginx in this case)
FROM nginx:alpine

# Step 8: Copy the build directory to the nginx public directory
COPY --from=build /app/build /usr/share/nginx/html

# Step 9: Expose the port nginx will run on
EXPOSE 80

# Step 10: Start nginx
CMD ["nginx", "-g", "daemon off;"]
