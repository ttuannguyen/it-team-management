package com.cooksys.groupfinal.dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

@NoArgsConstructor
@Data
public class UserRequestDto {
	
	private CredentialsDto credentials;

    private ProfileDto profile;
    
    private boolean isAdmin;
    
    private Long companyId;
    

}