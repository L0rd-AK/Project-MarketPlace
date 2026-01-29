# Production Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Security
- [ ] Change all JWT secrets to strong random values (use `openssl rand -base64 32`)
- [ ] Update MongoDB connection string to production database
- [ ] Enable MongoDB authentication and create database user
- [ ] Set `NODE_ENV=production` in environment
- [ ] Review and whitelist MongoDB Atlas IP addresses
- [ ] Enable HTTPS/TLS for all connections
- [ ] Set secure cookie settings (`sameSite: 'none'`, `secure: true`)
- [ ] Review CORS allowed origins (update `CLIENT_URL`)
- [ ] Scan dependencies for vulnerabilities (`npm audit`)
- [ ] Remove or secure any debug endpoints
- [ ] Implement rate limiting (consider express-rate-limit)
- [ ] Add helmet.js for security headers

### Environment Variables
- [ ] Server `.env` configured with production values
- [ ] Client `.env` configured with production API URL
- [ ] No `.env` files committed to repository
- [ ] All required env vars documented in `.env.example`
- [ ] API keys and secrets stored securely (use secret manager)

### Database
- [ ] MongoDB indexes created (auto-created on first query)
- [ ] Database backup strategy in place
- [ ] Connection pooling configured appropriately
- [ ] Seed script works with production data (if applicable)

### Code Quality
- [ ] All TypeScript errors resolved (`npm run build` succeeds)
- [ ] No console.logs with sensitive information
- [ ] Error messages don't expose system internals
- [ ] All API routes tested manually or with automated tests
- [ ] Frontend builds without warnings (`npm run build`)
- [ ] Code reviewed for security issues

### File Upload
- [ ] File upload directory has correct permissions
- [ ] Consider cloud storage (S3, GCS) for production
- [ ] File size limits appropriate for use case
- [ ] File type validation working correctly
- [ ] Implement virus scanning if accepting files from untrusted users

## Backend Deployment

### Platform: Render/Railway/Fly.io

- [ ] Create new web service
- [ ] Connect to GitHub repository
- [ ] Configure environment variables:
  - [ ] `PORT` (often auto-set by platform)
  - [ ] `NODE_ENV=production`
  - [ ] `MONGODB_URI` (MongoDB Atlas)
  - [ ] `JWT_ACCESS_SECRET`
  - [ ] `JWT_REFRESH_SECRET`
  - [ ] `CLIENT_URL` (deployed frontend URL)
  - [ ] `MAX_FILE_SIZE`
  - [ ] `UPLOAD_DIR`

- [ ] Set build command: `cd server && npm install && npm run build`
- [ ] Set start command: `cd server && npm start`
- [ ] Configure health check endpoint: `/api/health`
- [ ] Enable auto-deploy from main branch
- [ ] Set up monitoring/alerts
- [ ] Configure logging

### Post-Deployment
- [ ] Test health check endpoint
- [ ] Verify MongoDB connection
- [ ] Test authentication flow
- [ ] Check CORS settings work
- [ ] Verify file uploads work
- [ ] Monitor error logs

## Frontend Deployment

### Platform: Vercel/Netlify

- [ ] Create new site from repository
- [ ] Configure build settings:
  - [ ] Build command: `cd client && npm install && npm run build`
  - [ ] Publish directory: `client/dist`
  - [ ] Node version: 18 or higher

- [ ] Set environment variables:
  - [ ] `VITE_API_URL` (deployed backend URL)

- [ ] Configure redirects for SPA routing:
  ```
  /* /index.html 200
  ```

- [ ] Enable HTTPS (usually automatic)
- [ ] Configure custom domain (if applicable)
- [ ] Enable auto-deploy from main branch

### Post-Deployment
- [ ] Test all pages load correctly
- [ ] Verify API calls work
- [ ] Test authentication flow end-to-end
- [ ] Check cookies are set correctly
- [ ] Test all user flows (admin, buyer, solver)
- [ ] Verify animations work
- [ ] Test file upload functionality
- [ ] Check responsive design on mobile

## MongoDB Atlas Setup

- [ ] Create production cluster
- [ ] Configure network access:
  - [ ] Add deployment platform IP addresses
  - [ ] Or allow access from anywhere (0.0.0.0/0) with strong auth

- [ ] Create database user with strong password
- [ ] Enable monitoring and alerts
- [ ] Configure automated backups
- [ ] Set up daily snapshots
- [ ] Test connection string from deployment platform

## DNS & Domain (Optional)

- [ ] Purchase domain name
- [ ] Configure DNS records:
  - [ ] A/CNAME for frontend
  - [ ] A/CNAME for backend API
  - [ ] SSL/TLS certificates (usually automatic with Vercel/Netlify)

- [ ] Update `CLIENT_URL` in backend
- [ ] Update `VITE_API_URL` in frontend
- [ ] Test custom domain access

## Testing in Production

### Smoke Tests
- [ ] Register new user
- [ ] Login as admin
- [ ] Login as buyer
- [ ] Login as solver
- [ ] Create project as buyer
- [ ] Request project as solver
- [ ] Assign solver as buyer
- [ ] Create task as solver
- [ ] Upload file as solver
- [ ] Review submission as buyer
- [ ] Logout works correctly

### Security Tests
- [ ] Try accessing admin routes as buyer (should fail)
- [ ] Try accessing buyer routes as solver (should fail)
- [ ] Try uploading non-ZIP file (should fail)
- [ ] Try uploading oversized file (should fail)
- [ ] Verify JWT expiration works
- [ ] Test CORS with different origins
- [ ] Verify httpOnly cookies cannot be accessed by JS

### Performance Tests
- [ ] Check page load times
- [ ] Test with large datasets
- [ ] Monitor database query performance
- [ ] Check file upload speed
- [ ] Verify animations don't lag

## Monitoring & Maintenance

### Set Up
- [ ] Configure application monitoring (e.g., Sentry, LogRocket)
- [ ] Set up uptime monitoring (e.g., UptimeRobot)
- [ ] Configure error alerting
- [ ] Set up performance monitoring
- [ ] Enable access logs review

### Regular Maintenance
- [ ] Monitor database size and performance
- [ ] Review and rotate logs
- [ ] Update dependencies monthly (`npm update`)
- [ ] Check for security advisories (`npm audit`)
- [ ] Review and cleanup old uploads
- [ ] Monitor API rate limits
- [ ] Check disk space usage

## Documentation

- [ ] Update README with production URLs
- [ ] Document deployment process for team
- [ ] Create runbook for common issues
- [ ] Document environment variables
- [ ] Prepare user documentation if needed
- [ ] Create API documentation (consider Swagger/OpenAPI)

## Rollback Plan

- [ ] Document rollback procedure
- [ ] Keep previous deployment version accessible
- [ ] Database migration rollback plan
- [ ] Contact information for team members

## Legal & Compliance

- [ ] Privacy policy in place (if collecting user data)
- [ ] Terms of service defined
- [ ] GDPR compliance (if applicable)
- [ ] Data retention policy
- [ ] Cookie consent (if required)

## Post-Launch

- [ ] Announce launch to stakeholders
- [ ] Monitor closely for first 24-48 hours
- [ ] Be ready for quick fixes
- [ ] Collect user feedback
- [ ] Plan iteration based on feedback

## Recommended Production Improvements

### Short Term
- [ ] Add request rate limiting
- [ ] Implement refresh token rotation
- [ ] Add email verification for new users
- [ ] Implement password reset flow
- [ ] Add request logging middleware
- [ ] Implement API versioning (/api/v1/...)

### Medium Term
- [ ] Add comprehensive unit tests
- [ ] Add integration tests
- [ ] Implement CI/CD pipeline
- [ ] Add end-to-end tests (Playwright/Cypress)
- [ ] Implement caching (Redis)
- [ ] Add search functionality
- [ ] Implement real-time notifications (WebSocket)

### Long Term
- [ ] Implement payment processing
- [ ] Add messaging system
- [ ] Implement rating/review system
- [ ] Add advanced analytics
- [ ] Implement multi-language support
- [ ] Add mobile app (React Native)

---

## Quick Reference

### Checking Production Health

**Backend:**
```bash
curl https://your-backend-url.com/api/health
```

**Frontend:**
```bash
curl https://your-frontend-url.com
```

### Common Issues

**Issue:** CORS errors in production
**Solution:** Ensure `CLIENT_URL` in backend matches frontend domain exactly

**Issue:** Cookies not being set
**Solution:** Check `sameSite` and `secure` settings match HTTPS setup

**Issue:** 401 on all requests
**Solution:** Verify JWT secrets are set and cookies are being sent

**Issue:** File uploads fail
**Solution:** Check file size limits and disk space on server

**Issue:** MongoDB connection fails
**Solution:** Verify IP whitelist and connection string

---

**Remember:** Test thoroughly in staging environment before production deployment!
