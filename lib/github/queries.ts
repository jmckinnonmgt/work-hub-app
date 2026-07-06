export const PROJECT_QUERY = /* GraphQL */ `
  query($login: String!, $number: Int!, $cursor: String) {
    user(login: $login) {
      projectV2(number: $number) {
        id
        fields(first: 50) {
          nodes {
            __typename
            ... on ProjectV2FieldCommon { id name }
            ... on ProjectV2SingleSelectField { id name options { id name } }
          }
        }
        items(first: 100, after: $cursor) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            content { __typename ... on Issue { number title url } }
            fieldValues(first: 20) {
              nodes {
                __typename
                ... on ProjectV2ItemFieldSingleSelectValue { name field { ... on ProjectV2SingleSelectField { name } } }
                ... on ProjectV2ItemFieldTextValue { text field { ... on ProjectV2FieldCommon { name } } }
              }
            }
          }
        }
      }
    }
  }
`;

export const UPDATE_FIELD_MUTATION = /* GraphQL */ `
  mutation($project: ID!, $item: ID!, $field: ID!, $option: String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $project, itemId: $item, fieldId: $field,
      value: { singleSelectOptionId: $option }
    }) { projectV2Item { id } }
  }
`;

export const UPDATE_TEXT_MUTATION = /* GraphQL */ `
  mutation($project: ID!, $item: ID!, $field: ID!, $text: String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $project, itemId: $item, fieldId: $field,
      value: { text: $text }
    }) { projectV2Item { id } }
  }
`;

export const CLEAR_FIELD_MUTATION = /* GraphQL */ `
  mutation($project: ID!, $item: ID!, $field: ID!) {
    clearProjectV2ItemFieldValue(input: { projectId: $project, itemId: $item, fieldId: $field }) {
      projectV2Item { id }
    }
  }
`;

export const ADD_ITEM_MUTATION = /* GraphQL */ `
  mutation($project: ID!, $content: ID!) {
    addProjectV2ItemById(input: { projectId: $project, contentId: $content }) {
      item { id }
    }
  }
`;
