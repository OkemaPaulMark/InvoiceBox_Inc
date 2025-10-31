# Deploy InvoiceBox to Render

## Step-by-Step Deployment Guide

### Prerequisites
- GitHub account
- Render account (free tier available)
- Your InvoiceBox code pushed to GitHub

### Step 1: Prepare Your Repository

1. **Push your code to GitHub**:
   ```bash
   git add .
   git commit -m "Prepare for Render deployment"
   git push origin main
   ```

### Step 2: Deploy on Render

1. **Go to Render Dashboard**:
   - Visit [https://dashboard.render.com](https://dashboard.render.com)
   - Sign in with your GitHub account

2. **Create New Web Service**:
   - Click "New" → "Web Service"
   - Connect your GitHub repository
   - Select your InvoiceBox repository

3. **Configure the Service**:
   - **Name**: `invoicebox-app` (or any name you prefer)
   - **Environment**: `Docker`
   - **Region**: Choose closest to your users
   - **Branch**: `main`
   - **Root Directory**: Leave empty (uses root)
   - **Dockerfile Path**: `./Dockerfile`

4. **Set Environment Variables** (Optional):
   - You can add any environment variables if needed
   - For basic setup, no additional variables are required

5. **Choose Plan**:
   - Select "Free" plan for testing
   - Click "Create Web Service"

### Step 3: Wait for Deployment

1. **Monitor Build Process**:
   - Render will automatically build your Docker image
   - This may take 5-10 minutes for the first deployment
   - Watch the logs for any errors

2. **Deployment Complete**:
   - Once deployed, you'll get a URL like: `https://invoicebox-app.onrender.com`
   - Your app will be live at this URL

### Step 4: Test Your Application

1. **Access Your App**:
   - Visit your Render URL
   - You should see the InvoiceBox login page

2. **Test Functionality**:
   - Register a new account (Provider or Purchaser)
   - Login and test the dashboard
   - Create invoices (if Provider)
   - Test all features

### Important Notes

#### Free Tier Limitations
- **Sleep Mode**: Free services sleep after 15 minutes of inactivity
- **Cold Starts**: First request after sleep may take 30+ seconds
- **Monthly Hours**: 750 hours per month (sufficient for testing)

#### Database Considerations
- **SQLite**: Database resets on each deployment
- **Data Persistence**: For production, consider upgrading to PostgreSQL
- **Dummy Data**: Will be recreated on each restart

#### Performance Tips
- **Keep Alive**: Use a service like UptimeRobot to ping your app
- **Upgrade**: Consider paid plans for production use

### Troubleshooting

#### Common Issues:

1. **Build Fails**:
   - Check Dockerfile syntax
   - Ensure all files are committed to Git
   - Review build logs in Render dashboard

2. **App Won't Start**:
   - Check if port 8000 is properly exposed
   - Verify FastAPI starts correctly
   - Review application logs

3. **Frontend Not Loading**:
   - Ensure static files are built correctly
   - Check if React build completed successfully

4. **API Calls Failing**:
   - Verify API endpoints are accessible
   - Check CORS configuration
   - Ensure authentication is working

#### Getting Help:
- Check Render documentation: [https://render.com/docs](https://render.com/docs)
- Review application logs in Render dashboard
- Check GitHub repository for any missing files

### Success! 🎉

Your InvoiceBox application should now be live and accessible worldwide through your Render URL. You can share this URL with others to demonstrate your application.

### Next Steps (Optional):
- Set up custom domain
- Configure environment variables for production
- Set up database persistence with PostgreSQL
- Implement monitoring and logging
- Consider upgrading to paid plan for better performance