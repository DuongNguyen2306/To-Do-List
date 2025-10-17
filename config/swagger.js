const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ToDoList API',
      version: '1.0.0',
      description: 'API documentation for ToDoList application',
      contact: {
        name: 'API Support',
        email: 'support@todolist.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        },
        cookieAuth: {
          type: 'apiKey',
          in: 'cookie',
          name: 'refreshToken'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'User ID'
            },
            name: {
              type: 'string',
              description: 'User name'
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'User email'
            },
            avatarUrl: {
              type: 'string',
              description: 'User avatar URL'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'User creation date'
            }
          }
        },
        Task: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Task ID'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns the task'
            },
            title: {
              type: 'string',
              maxLength: 255,
              description: 'Task title'
            },
            description: {
              type: 'string',
              description: 'Task description'
            },
            status: {
              type: 'string',
              enum: ['To do', 'In progress', 'On approval', 'Done'],
              default: 'To do',
              description: 'Task status'
            },
            priority: {
              type: 'string',
              enum: ['low', 'medium', 'high'],
              default: 'medium',
              description: 'Task priority'
            },
            project: {
              type: 'string',
              description: 'Project name'
            },
            tags: {
              type: 'array',
              items: {
                type: 'string'
              },
              description: 'Task tags'
            },
            dueDate: {
              type: 'string',
              format: 'date-time',
              description: 'Task due date'
            },
            reminderAt: {
              type: 'string',
              format: 'date-time',
              description: 'Task reminder date'
            },
            isArchived: {
              type: 'boolean',
              default: false,
              description: 'Whether task is archived'
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Task creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Task last update date'
            }
          }
        },
        AuthResponse: {
          type: 'object',
          properties: {
            accessToken: {
              type: 'string',
              description: 'JWT access token'
            },
            user: {
              $ref: '#/components/schemas/User'
            }
          }
        },
        Error: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              description: 'Error message'
            },
            errors: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  msg: {
                    type: 'string'
                  },
                  param: {
                    type: 'string'
                  },
                  location: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        TaskListResponse: {
          type: 'object',
          properties: {
            tasks: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Task'
              }
            },
            total: {
              type: 'integer',
              description: 'Total number of tasks'
            },
            page: {
              type: 'integer',
              description: 'Current page number'
            },
            limit: {
              type: 'integer',
              description: 'Number of items per page'
            }
          }
        },
        SyncOperation: {
          type: 'object',
          properties: {
            op: {
              type: 'string',
              enum: ['create', 'update', 'delete'],
              description: 'Operation type'
            },
            clientOpId: {
              type: 'string',
              description: 'Client operation ID'
            },
            clientId: {
              type: 'string',
              description: 'Client task ID'
            },
            task: {
              $ref: '#/components/schemas/Task'
            }
          }
        },
        SyncResponse: {
          type: 'object',
          properties: {
            results: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  clientOpId: {
                    type: 'string'
                  },
                  status: {
                    type: 'string',
                    enum: ['success', 'error']
                  },
                  message: {
                    type: 'string'
                  },
                  serverTask: {
                    $ref: '#/components/schemas/Task'
                  }
                }
              }
            },
            mappings: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  clientId: {
                    type: 'string'
                  },
                  serverId: {
                    type: 'string'
                  }
                }
              }
            }
          }
        },
        MonthlyGoal: {
          type: 'object',
          properties: {
            _id: {
              type: 'string',
              description: 'Monthly goal ID'
            },
            userId: {
              type: 'string',
              description: 'User ID who owns the goal'
            },
            title: {
              type: 'string',
              maxLength: 255,
              description: 'Goal title'
            },
            description: {
              type: 'string',
              description: 'Goal description'
            },
            dailyTime: {
              type: 'string',
              pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$',
              description: 'Daily time in HH:MM format'
            },
            startDate: {
              type: 'string',
              format: 'date-time',
              description: 'Goal start date'
            },
            endDate: {
              type: 'string',
              format: 'date-time',
              description: 'Goal end date'
            },
            timezone: {
              type: 'string',
              description: 'User timezone'
            },
            status: {
              type: 'string',
              enum: ['active', 'paused', 'completed', 'cancelled'],
              description: 'Goal status'
            },
            repeatConfig: {
              type: 'object',
              properties: {
                weekdays: {
                  type: 'array',
                  items: {
                    type: 'integer',
                    minimum: 0,
                    maximum: 6
                  },
                  description: 'Days of week (0=Sunday, 6=Saturday)'
                },
                includeWeekends: {
                  type: 'boolean',
                  description: 'Include weekends'
                }
              }
            },
            stats: {
              type: 'object',
              properties: {
                completedDays: {
                  type: 'integer',
                  description: 'Number of completed days'
                },
                totalDays: {
                  type: 'integer',
                  description: 'Total days in current month'
                },
                completionRate: {
                  type: 'integer',
                  description: 'Completion rate percentage'
                },
                lastStatsUpdate: {
                  type: 'string',
                  format: 'date-time',
                  description: 'Last stats update time'
                }
              }
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
              description: 'Goal creation date'
            },
            updatedAt: {
              type: 'string',
              format: 'date-time',
              description: 'Goal last update date'
            }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
    apis: ['./routers/*.js', './controllers/*.js', './models/*.js']
};

const specs = swaggerJsdoc(options);

module.exports = specs;
