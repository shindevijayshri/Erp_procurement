package com.erp.dto;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class RFQRequest {

    private Long prId;

    private List<Long> vendorIds;
}
