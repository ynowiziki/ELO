Functional Specifications
==============

The purpose of this document is to describe the expected functionality of the e-learning community. Comments are welcome and appreciated.

As discussed in README.md, the kernel of the app is a mechanism that encourages members to share their learning experience, methods and materials, so that people at all levels could benefit from the community. On the other hand, post owners could also learn from the feedback their followers give.

But how? Luckily, We don't have to reinvent the wheel, since there are inspiring models from great communities, like GitHub or Stack Overflow, where members constantly contribute valuable ideas, answers and codes.

So, here comes the requirements:

Use Cases
--------------
- Users can upload their interested learning materials, markup their notes, comments and understandings. All these documents are open to be reviewed, commented, forwarded, or scored by other users.
- For all these documents, there are two types of media being supported: text and audio. (Maybe later video will be enlisted.)
- The main input UI is a rich editor, where both types of media can be mixed for users to edit learning materials, give feedback, and practice interactively.
- Materials with highest scores will be recommended to other users who concern the specific subject;
- By following another user, an user can see all the new materials it published.
- Base on same set of materials, users can initiate or join a specific group, in which group members can compare progress, discuss problems and challenge each other.


Technical Architecture
--------------
- Back-end is a set of Node.js Restful API.
- Front-end is a AngularJS single page app, which communicates with backend in JSON.
- On data persistent, MongoDB is the back-end platform, while IndexedDB is used in front-end as offline cache.
- Front-end could also be packaged into a Chrome App to better support offline mode.
- Production system will be deployed on some Cloud platform, but only for developing period. No further support for the production system is guaranteed once the development work is done.
- Use Bootstrap as front-end styles lib.

Schedule
--------------
- Refining functional specs:     2 weeks
- Development and testing:       4 weeks
