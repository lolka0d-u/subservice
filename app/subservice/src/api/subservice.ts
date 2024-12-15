export type Subservice = {
  "address": "EvHqnZaXDeqTVSgmtFqjVEUhTchtZAiUXi8gme7juq58",
  "metadata": {
    "name": "subservice",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "createCreatorAccount",
      "discriminator": [
        143,
        171,
        134,
        197,
        97,
        154,
        24,
        105
      ],
      "accounts": [
        {
          "name": "creatorAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "paytoAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "name",
          "type": "string"
        },
        {
          "name": "subscriptionPlansPrices",
          "type": {
            "vec": "u64"
          }
        },
        {
          "name": "subscriptionPlansNames",
          "type": {
            "vec": "string"
          }
        },
        {
          "name": "subscriptionPlansImages",
          "type": {
            "vec": "string"
          }
        }
      ]
    },
    {
      "name": "createUserAccount",
      "discriminator": [
        146,
        68,
        100,
        69,
        63,
        46,
        182,
        199
      ],
      "accounts": [
        {
          "name": "userAccount",
          "writable": true,
          "signer": true
        },
        {
          "name": "signer",
          "writable": true,
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "getSubscriptionLink",
      "discriminator": [
        193,
        156,
        103,
        97,
        31,
        180,
        173,
        87
      ],
      "accounts": [
        {
          "name": "userAccount",
          "writable": true
        }
      ],
      "args": [
        {
          "name": "subscriptionIndex",
          "type": "u8"
        }
      ]
    },
    {
      "name": "logUserSubscriptions",
      "discriminator": [
        70,
        110,
        105,
        194,
        191,
        11,
        48,
        250
      ],
      "accounts": [
        {
          "name": "userAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "purchaseSubscription",
      "discriminator": [
        219,
        151,
        184,
        220,
        138,
        36,
        203,
        237
      ],
      "accounts": [
        {
          "name": "paytoAccount",
          "writable": true
        },
        {
          "name": "creatorAccount",
          "writable": true
        },
        {
          "name": "userAccount",
          "writable": true
        },
        {
          "name": "signer",
          "signer": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "solAmount",
          "type": "u64"
        },
        {
          "name": "optionIndex",
          "type": "u8"
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "creatorAccount",
      "discriminator": [
        222,
        163,
        32,
        169,
        204,
        8,
        200,
        32
      ]
    },
    {
      "name": "userAccount",
      "discriminator": [
        211,
        33,
        136,
        16,
        186,
        110,
        242,
        127
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "invalidAmountOfSol",
      "msg": "Wrong amount of SOL!"
    },
    {
      "code": 6001,
      "name": "itemDoesNotExist",
      "msg": "Item does not exist in this collection!"
    },
    {
      "code": 6002,
      "name": "keysMismatch",
      "msg": "Pay keys mismatch!"
    },
    {
      "code": 6003,
      "name": "tooManyPlans",
      "msg": "Too many subscription plans!"
    },
    {
      "code": 6004,
      "name": "invalidInputLength",
      "msg": "Invalid input length!"
    },
    {
      "code": 6005,
      "name": "nameTooLong",
      "msg": "Name too long!"
    },
    {
      "code": 6006,
      "name": "urlTooLong",
      "msg": "URL too long!"
    },
    {
      "code": 6007,
      "name": "invalidUrlFormat",
      "msg": "Invalid URL format!"
    }
  ],
  "types": [
    {
      "name": "creatorAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "payto",
            "type": "pubkey"
          },
          {
            "name": "name",
            "type": "bytes"
          },
          {
            "name": "subscriptionPlansPrices",
            "type": {
              "vec": "bytes"
            }
          },
          {
            "name": "subscriptionPlansNames",
            "type": {
              "vec": "bytes"
            }
          },
          {
            "name": "subscriptionPlansImages",
            "type": {
              "vec": "bytes"
            }
          }
        ]
      }
    },
    {
      "name": "userAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "subscriptionKeys",
            "type": {
              "vec": "pubkey"
            }
          },
          {
            "name": "subscriptionLinks",
            "type": {
              "vec": "bytes"
            }
          },
          {
            "name": "subscriptionNames",
            "type": {
              "vec": "bytes"
            }
          },
          {
            "name": "subscriptionEndtime",
            "type": {
              "vec": "i64"
            }
          }
        ]
      }
    }
  ]
};
