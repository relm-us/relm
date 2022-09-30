/**
 * Parameters passed to the page via URL or inline
 */
export type PageParams = {
  // unique human name for the relm
  relmName: string;
  // a named location within the relm
  entryway: string;
  // whether or not we are inside a 'clone relm' request
  isCloneRequest: boolean;
  // an optional invitation token
  invitationToken?: string;
  // an optional JWT token
  jsonWebToken?: string;
};
