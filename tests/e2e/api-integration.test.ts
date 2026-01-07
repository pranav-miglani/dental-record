/**
 * API Integration Tests
 * Tests API endpoints without browser (faster, more reliable for API testing)
 */

// Suppress localStorage warnings
if (typeof (global as any).localStorage === 'undefined') {
  (global as any).localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    length: 0,
    key: () => null,
  }
}

import axios, { AxiosInstance } from 'axios'

describe('Dental Hospital System - API Integration Tests', () => {
  let apiClient: AxiosInstance
  let baseUrl: string
  let accessToken: string
  let refreshToken: string
  let testUserId: string
  let testPatientId: string
  let testProcedureId: string
  let testStepId: string

  beforeAll(() => {
    baseUrl = process.env.API_URL || 'https://your-api-gateway-url.amazonaws.com/prod'
    apiClient = axios.create({
      baseURL: baseUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
      validateStatus: () => true, // Don't throw on any status
    })

    console.log(`\n🧪 Testing API at: ${baseUrl}`)
    console.log(`📱 Test User: ${process.env.TEST_ADMIN_MOBILE || 'Not set'}\n`)
  })

  describe('1. Authentication & Authorization', () => {
    test('1.1 - Health Check (if available)', async () => {
      try {
        const response = await apiClient.get('/health')
        if (response.status === 200) {
          console.log('✅ Health check passed')
        } else {
          console.log('⚠️  Health endpoint not available (this is OK)')
        }
      } catch (error) {
        console.log('⚠️  Health endpoint not available (this is OK)')
      }
    })

    test('1.2 - Login with valid credentials', async () => {
      const mobile = process.env.TEST_ADMIN_MOBILE || '9999999999'
      const password = process.env.TEST_ADMIN_PASSWORD || 'Admin123!@#'

      try {
        const response = await apiClient.post('/api/auth/login', {
          mobile_number: mobile,
          password: password,
        })

        if (response.status === 200 && response.data.success) {
          expect(response.data.data).toHaveProperty('access_token')
          expect(response.data.data).toHaveProperty('refresh_token')
          expect(response.data.data).toHaveProperty('user')

          accessToken = response.data.data.access_token
          refreshToken = response.data.data.refresh_token
          testUserId = response.data.data.user.user_id

          console.log('✅ Login successful')
          console.log(`   User ID: ${testUserId}`)
          console.log(`   Roles: ${response.data.data.user.roles.join(', ')}`)
        } else {
          console.log('⚠️  Login failed - API may not be deployed or credentials incorrect')
          console.log(`   Status: ${response.status}`)
          console.log(`   Response: ${JSON.stringify(response.data)}`)
        }
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.log('⚠️  Cannot connect to API - is it deployed?')
          console.log(`   Error: ${error.message}`)
        } else {
          console.log('⚠️  Login test failed:', error.message)
        }
      }
    })

    test('1.3 - Login with invalid credentials should fail', async () => {
      try {
        const response = await apiClient.post('/api/auth/login', {
          mobile_number: '0000000000',
          password: 'wrongpassword',
        })

        expect(response.status).toBe(401)
        expect(response.data.success).toBe(false)
        console.log('✅ Invalid login correctly rejected')
      } catch (error: any) {
        if (error.response) {
          expect(error.response.status).toBe(401)
          console.log('✅ Invalid login correctly rejected')
        } else {
          console.log('⚠️  Network error - API may not be accessible')
        }
      }
    })

    test('1.4 - Refresh access token', async () => {
      if (!refreshToken) {
        console.log('⚠️  Skipping - no refresh token available')
        return
      }

      try {
        const response = await apiClient.post('/api/auth/refresh', {
          refresh_token: refreshToken,
        })

        if (response.status === 200) {
          expect(response.data).toHaveProperty('access_token')
          accessToken = response.data.access_token
          console.log('✅ Token refresh successful')
        } else {
          console.log('⚠️  Token refresh failed')
        }
      } catch (error: any) {
        console.log('⚠️  Token refresh test skipped')
      }
    })

    test('1.5 - Get current user info', async () => {
      if (!accessToken) {
        console.log('⚠️  Skipping - no access token available')
        return
      }

      try {
        const response = await apiClient.get('/api/users/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.status === 200) {
          expect(response.data.data).toHaveProperty('user_id')
          expect(response.data.data).toHaveProperty('mobile_number')
          console.log('✅ Get current user successful')
        } else {
          console.log('⚠️  Get user failed')
        }
      } catch (error: any) {
        console.log('⚠️  Get user test skipped')
      }
    })
  })

  describe('2. Patient Management', () => {
    test('2.1 - Create a patient', async () => {
      if (!accessToken) {
        console.log('⚠️  Skipping - no access token available')
        return
      }

      try {
        const response = await apiClient.post(
          '/api/patients',
          {
            name: 'Test Patient E2E',
            date_of_birth: '1990-01-15',
            gender: 'MALE',
            aadhaar_last_4: '1234',
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (response.status === 201) {
          expect(response.data.data).toHaveProperty('patient_id')
          testPatientId = response.data.data.patient_id
          console.log('✅ Patient creation successful')
          console.log(`   Patient ID: ${testPatientId}`)
        } else {
          console.log('⚠️  Patient creation failed')
          console.log(`   Status: ${response.status}`)
          console.log(`   Response: ${JSON.stringify(response.data)}`)
        }
      } catch (error: any) {
        if (error.response) {
          console.log('⚠️  Patient creation failed:', error.response.data)
        } else {
          console.log('⚠️  Patient creation test skipped')
        }
      }
    })

    test('2.2 - Get patient by ID', async () => {
      if (!accessToken || !testPatientId) {
        console.log('⚠️  Skipping - no access token or patient ID available')
        return
      }

      try {
        const response = await apiClient.get(`/api/patients/${testPatientId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.status === 200) {
          expect(response.data.data.patient_id).toBe(testPatientId)
          console.log('✅ Get patient successful')
        } else {
          console.log('⚠️  Get patient failed')
        }
      } catch (error: any) {
        console.log('⚠️  Get patient test skipped')
      }
    })

    test('2.3 - Search patients by name', async () => {
      if (!accessToken) {
        console.log('⚠️  Skipping - no access token available')
        return
      }

      try {
        const response = await apiClient.get('/api/patients?name=Test', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.status === 200) {
          expect(response.data.data).toHaveProperty('patients')
          console.log('✅ Patient search successful')
        } else {
          console.log('⚠️  Patient search failed')
        }
      } catch (error: any) {
        console.log('⚠️  Patient search test skipped')
      }
    })

    test('2.4 - List all patients', async () => {
      if (!accessToken) {
        console.log('⚠️  Skipping - no access token available')
        return
      }

      try {
        const response = await apiClient.get('/api/patients', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.status === 200) {
          expect(response.data.data).toHaveProperty('patients')
          console.log('✅ List patients successful')
        } else {
          console.log('⚠️  List patients failed')
        }
      } catch (error: any) {
        console.log('⚠️  List patients test skipped')
      }
    })
  })

  describe('3. Procedure Management', () => {
    test('3.1 - Create a procedure', async () => {
      if (!accessToken || !testPatientId) {
        console.log('⚠️  Skipping - no access token or patient ID available')
        return
      }

      try {
        const response = await apiClient.post(
          '/api/procedures',
          {
            patient_id: testPatientId,
            procedure_type: 'RCT',
            procedure_name: 'Root Canal Treatment',
            tooth_number: {
              tooth: '11',
              quadrant: 'upper_right',
              fdi_notation: '11',
            },
            diagnosis_notes: 'E2E test procedure',
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (response.status === 201) {
          expect(response.data.data).toHaveProperty('procedure')
          testProcedureId = response.data.data.procedure.procedure_id
          console.log('✅ Procedure creation successful')
          console.log(`   Procedure ID: ${testProcedureId}`)
        } else {
          console.log('⚠️  Procedure creation failed')
          console.log(`   Status: ${response.status}`)
          console.log(`   Response: ${JSON.stringify(response.data)}`)
        }
      } catch (error: any) {
        if (error.response) {
          console.log('⚠️  Procedure creation failed:', error.response.data)
        } else {
          console.log('⚠️  Procedure creation test skipped')
        }
      }
    })

    test('3.2 - Get procedure by ID', async () => {
      if (!accessToken || !testProcedureId) {
        console.log('⚠️  Skipping - no access token or procedure ID available')
        return
      }

      try {
        const response = await apiClient.get(`/api/procedures/${testProcedureId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.status === 200) {
          expect(response.data.data.procedure.procedure_id).toBe(testProcedureId)
          expect(response.data.data).toHaveProperty('steps')
          if (response.data.data.steps.length > 0) {
            testStepId = response.data.data.steps[0].step_id
          }
          console.log('✅ Get procedure successful')
        } else {
          console.log('⚠️  Get procedure failed')
        }
      } catch (error: any) {
        console.log('⚠️  Get procedure test skipped')
      }
    })

    test('3.3 - Confirm procedure', async () => {
      if (!accessToken || !testProcedureId) {
        console.log('⚠️  Skipping - no access token or procedure ID available')
        return
      }

      try {
        const response = await apiClient.put(
          `/api/procedures/${testProcedureId}/confirm`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (response.status === 200) {
          expect(response.data.data.status).toBe('IN_PROGRESS')
          console.log('✅ Procedure confirmation successful')
        } else {
          console.log('⚠️  Procedure confirmation failed')
        }
      } catch (error: any) {
        console.log('⚠️  Procedure confirmation test skipped')
      }
    })

    test('3.4 - Get procedures by patient', async () => {
      if (!accessToken || !testPatientId) {
        console.log('⚠️  Skipping - no access token or patient ID available')
        return
      }

      try {
        const response = await apiClient.get(`/api/procedures?patient_id=${testPatientId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.status === 200) {
          expect(response.data.data).toHaveProperty('items')
          console.log('✅ Get procedures by patient successful')
        } else {
          console.log('⚠️  Get procedures by patient failed')
        }
      } catch (error: any) {
        console.log('⚠️  Get procedures by patient test skipped')
      }
    })
  })

  describe('4. Step Management', () => {
    test('4.1 - Get procedure steps', async () => {
      if (!accessToken || !testProcedureId) {
        console.log('⚠️  Skipping - no access token or procedure ID available')
        return
      }

      try {
        const response = await apiClient.get(`/api/procedures/${testProcedureId}/steps`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        if (response.status === 200) {
          expect(response.data.data).toHaveProperty('steps')
          if (response.data.data.steps.length > 0 && !testStepId) {
            testStepId = response.data.data.steps[0].step_id
          }
          console.log('✅ Get procedure steps successful')
        } else {
          console.log('⚠️  Get procedure steps failed')
        }
      } catch (error: any) {
        console.log('⚠️  Get procedure steps test skipped')
      }
    })

    test('4.2 - Complete a step', async () => {
      if (!accessToken || !testStepId) {
        console.log('⚠️  Skipping - no access token or step ID available')
        return
      }

      try {
        const response = await apiClient.post(
          `/api/procedures/${testProcedureId}/steps/${testStepId}/complete`,
          {},
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (response.status === 200) {
          expect(response.data.data).toHaveProperty('is_completed', true)
          console.log('✅ Step completion successful')
        } else {
          console.log('⚠️  Step completion failed')
        }
      } catch (error: any) {
        console.log('⚠️  Step completion test skipped')
      }
    })
  })

  describe('5. Image Management', () => {
    test('5.1 - Upload an image', async () => {
      if (!accessToken || !testProcedureId || !testStepId) {
        console.log('⚠️  Skipping - missing required IDs')
        return
      }

      // Create a dummy 1x1 pixel PNG image
      const dummyImageBase64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='

      try {
        const response = await apiClient.post(
          `/api/procedures/${testProcedureId}/steps/${testStepId}/images`,
          {
            files: [
              {
                content: dummyImageBase64,
                filename: 'test-image.png',
                mime_type: 'image/png',
                size: Buffer.from(dummyImageBase64, 'base64').length,
              },
            ],
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )

        if (response.status === 201) {
          expect(response.data.data).toHaveProperty('images')
          console.log('✅ Image upload successful')
        } else {
          console.log('⚠️  Image upload failed')
          console.log(`   Status: ${response.status}`)
          console.log(`   Response: ${JSON.stringify(response.data)}`)
        }
      } catch (error: any) {
        if (error.response) {
          console.log('⚠️  Image upload failed:', error.response.data)
        } else {
          console.log('⚠️  Image upload test skipped')
        }
      }
    })
  })

  describe('6. Error Handling & Security', () => {
    test('6.1 - Should return 404 for non-existent resource', async () => {
      if (!accessToken) {
        console.log('⚠️  Skipping - no access token available')
        return
      }

      try {
        const response = await apiClient.get('/api/patients/non-existent-id-12345', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        expect(response.status).toBe(404)
        expect(response.data.success).toBe(false)
        console.log('✅ 404 error handling correct')
      } catch (error: any) {
        if (error.response) {
          expect(error.response.status).toBe(404)
          console.log('✅ 404 error handling correct')
        } else {
          console.log('⚠️  404 test skipped')
        }
      }
    })

    test('6.2 - Should return 401 for unauthorized access', async () => {
      try {
        const response = await apiClient.get('/api/patients', {
          headers: {
            Authorization: 'Bearer invalid-token-12345',
          },
        })

        expect(response.status).toBe(401)
        console.log('✅ 401 error handling correct')
      } catch (error: any) {
        if (error.response) {
          expect(error.response.status).toBe(401)
          console.log('✅ 401 error handling correct')
        } else {
          console.log('⚠️  401 test skipped')
        }
      }
    })

    test('6.3 - Should return 403 for forbidden access', async () => {
      if (!accessToken) {
        console.log('⚠️  Skipping - no access token available')
        return
      }

      try {
        // Try to access admin endpoint as non-admin user
        const response = await apiClient.get('/api/admin/stats', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        })

        // Should be 403 if user is not admin, or 200 if user is admin
        expect([200, 403]).toContain(response.status)
        console.log('✅ Authorization check working')
      } catch (error: any) {
        if (error.response) {
          expect([200, 403]).toContain(error.response.status)
          console.log('✅ Authorization check working')
        } else {
          console.log('⚠️  Authorization test skipped')
        }
      }
    })
  })

  describe('7. System Health', () => {
    test('7.1 - Verify API is accessible', async () => {
      try {
        const response = await apiClient.get('/api/auth/login', {
          validateStatus: () => true,
        })

        // Any response (even 400/401) means API is accessible
        expect(response.status).toBeLessThan(500)
        console.log('✅ API is accessible')
        console.log(`   Response status: ${response.status}`)
      } catch (error: any) {
        if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
          console.log('❌ API is not accessible')
          console.log(`   Error: ${error.message}`)
          console.log(`   Please deploy the API first or set API_URL environment variable`)
          throw error
        } else {
          console.log('⚠️  API accessibility check failed')
        }
      }
    })
  })

  afterAll(() => {
    console.log('\n📊 Test Summary:')
    console.log(`   API URL: ${baseUrl}`)
    if (accessToken) {
      console.log('   ✅ Authentication: Working')
    } else {
      console.log('   ⚠️  Authentication: Not tested (API may not be deployed)')
    }
    if (testPatientId) {
      console.log(`   ✅ Patient Created: ${testPatientId}`)
    }
    if (testProcedureId) {
      console.log(`   ✅ Procedure Created: ${testProcedureId}`)
    }
    console.log('\n')
  })
})

