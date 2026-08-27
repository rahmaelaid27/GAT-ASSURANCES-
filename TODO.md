# Implementation Plan - GAT Assurances UI/UX Fixes

## ✅ Completed Steps:

## 📋 Pending Steps:

### 1. Backend - Add CIN field to ClientDto.java
   - [x] `ClientDto.java` - Add `cin` field (String)

### 2. Backend - Update ClientService.java to handle CIN
   - [x] `ClientService.java` - Pass `cin` to User entity on creation and update

### 3. Frontend - Update client-form.component.ts with CIN field
   - [ ] `client-form.component.ts` - Add CIN form control and input field in template

### 4. Frontend - Update client-list.component.ts with CIN column
   - [ ] `client-list.component.ts` - Add CIN column in table + hide "Nouveau client" for GESTIONNAIRE

### 5. Frontend - Update client-detail.component.ts to show CIN
   - [ ] `client-detail.component.ts` - Show CIN field in details

### 6. Backend - Add immatriculation to MissionMapper
   - [ ] `MissionMapper.java` - Map `sinistreImmatriculation` from Sinistre

### 7. Frontend - Update mission-form to use immatriculation
   - [ ] `mission-form.component.ts` - Replace sinistreId with immatriculation text search

### 8. Frontend - Update mission-list to show immatriculation
   - [ ] `mission-list.component.ts` - Show immatriculation instead of sinistreReference

### 9. Frontend - Update mission-detail to show immatriculation/CIN
   - [ ] `mission-detail.component.ts` - Show immatriculation

### 10. Frontend - Update client.model.ts
   - [ ] `client.model.ts` - Add `cin` field to ClientRequest interface

